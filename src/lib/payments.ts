/**
 * Paying a contribution by card.
 *
 * Card is Malipopay's hosted checkout: the API mints a checkout link, the
 * browser goes there, and the webhook settles the payment against the pledge.
 * Nothing here knows about the fee: the couple carries it, so the guest pays
 * exactly the amount they chose.
 */

export type PayMethod = 'mobile_money' | 'card';

/** Whether the API lists card among the ways to pay. */
export function offersCard(methods: readonly string[] | null | undefined): boolean {
  return methods?.includes('card') === true;
}

/**
 * The ways a guest can pay right now, in the order they are offered: mobile
 * money first (it is what most guests use), then card. `mobileAvailable` is
 * whether a push can be sent at all; without one, card stands alone.
 */
export function payOptions(methods: readonly string[] | null | undefined, mobileAvailable: boolean): PayMethod[] {
  const out: PayMethod[] = [];
  if (mobileAvailable) out.push('mobile_money');
  if (offersCard(methods)) out.push('card');
  return out;
}

export type CheckoutResult =
  | { ok: true; checkoutUrl: string }
  | {
      ok: false;
      /** The HTTP status, or 0 when the server could not be reached. */
      status: number;
      code?: string;
      message?: string;
      /** What the server says is still owed, when it refused a larger amount. */
      outstanding?: number;
    };

interface CheckoutBody {
  status?: string;
  checkoutUrl?: string;
  code?: string;
  message?: string;
  details?: { outstanding?: number };
}

/** Only a web page is a checkout: anything else (javascript:, data:) is refused. */
function safeCheckout(url: unknown): string | null {
  if (typeof url !== 'string') return null;
  try {
    const u = new URL(url);
    return u.protocol === 'https:' || u.protocol === 'http:' ? url : null;
  } catch {
    return null;
  }
}

async function postForCheckout(url: string, body: Record<string, unknown>): Promise<CheckoutResult> {
  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    return { ok: false, status: 0 };
  }
  const data = (await res.json().catch(() => ({}))) as CheckoutBody;
  if (res.ok) {
    // A 2xx that is not a checkout (a mobile money "pending", or a link that
    // is not a web page) is not something to send the browser to.
    const checkoutUrl = data.status === 'checkout' ? safeCheckout(data.checkoutUrl) : null;
    return checkoutUrl !== null ? { ok: true, checkoutUrl } : { ok: false, status: res.status };
  }
  return {
    ok: false,
    status: res.status,
    ...(typeof data.code === 'string' ? { code: data.code } : {}),
    ...(typeof data.message === 'string' ? { message: data.message } : {}),
    ...(typeof data.details?.outstanding === 'number' ? { outstanding: data.details.outstanding } : {}),
  };
}

/**
 * A card checkout for a pledge on the public michango page. Leave `amount`
 * out and the API charges what is still owed.
 */
export function changiaCardCheckout(
  apiBase: string,
  slug: string,
  input: { pledgeId: string; amount?: number },
): Promise<CheckoutResult> {
  return postForCheckout(`${apiBase}/changia/${encodeURIComponent(slug)}/card`, {
    pledgeId: input.pledgeId,
    ...(input.amount !== undefined ? { amount: input.amount } : {}),
  });
}

/** A card checkout from a personal invitation. A card rings nobody, so no phone. */
export function inviteCardCheckout(apiBase: string, token: string, amount: number): Promise<CheckoutResult> {
  return postForCheckout(`${apiBase}/rsvp/${encodeURIComponent(token)}/contribute`, { amount, method: 'card' });
}

/** Sends the browser to the checkout, keeping this page in its history. */
export function goToCheckout(url: string, location: Pick<Location, 'assign'>): void {
  location.assign(url);
}
