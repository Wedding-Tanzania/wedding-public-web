import { afterEach, describe, expect, it, vi } from 'vitest';
import { changiaCardCheckout, goToCheckout, inviteCardCheckout, offersCard, payOptions } from './payments';

const API = 'https://api.test/api/v1';
const CHECKOUT = 'https://demo.malipopay.co.tz/checkout?ref=ML_SANDBOX_WBL-7Q2K&method=card';

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

/** Stubs fetch with one answer and hands back the mock, to read the request off. */
function answer(res: Response | Error) {
  const fn = vi.fn(async () => {
    if (res instanceof Error) throw res;
    return res;
  });
  vi.stubGlobal('fetch', fn);
  return fn;
}

function sent(fn: ReturnType<typeof answer>): { url: string; init: RequestInit; body: unknown } {
  const [url, init] = fn.mock.calls[0] as unknown as [string, RequestInit];
  return { url, init, body: JSON.parse(String(init.body)) };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('offersCard and payOptions', () => {
  it('offers card only when the API lists it', () => {
    expect(offersCard(['mobile_money', 'card'])).toBe(true);
    expect(offersCard(['mobile_money'])).toBe(false);
    expect(offersCard([])).toBe(false);
    expect(offersCard(undefined)).toBe(false);
    expect(offersCard(null)).toBe(false);
  });

  it('puts mobile money first, then card', () => {
    expect(payOptions(['card', 'mobile_money'], true)).toEqual(['mobile_money', 'card']);
  });

  it('is mobile money alone while card is off', () => {
    expect(payOptions(['mobile_money'], true)).toEqual(['mobile_money']);
    expect(payOptions(undefined, true)).toEqual(['mobile_money']);
  });

  it('is card alone when there is no push to send', () => {
    expect(payOptions(['mobile_money', 'card'], false)).toEqual(['card']);
  });

  it('is nothing when there is neither', () => {
    expect(payOptions(['mobile_money'], false)).toEqual([]);
  });
});

describe('changiaCardCheckout', () => {
  it('posts the pledge and amount to the card route and hands back the checkout', async () => {
    const fn = answer(json({ intentId: 'i1', reference: 'WBL-7Q2K', amount: 50_000, outstanding: 150_000, status: 'checkout', checkoutUrl: CHECKOUT }, 202));
    const r = await changiaCardCheckout(API, 'andrew-franciana', { pledgeId: 'p1', amount: 50_000 });
    expect(r).toEqual({ ok: true, checkoutUrl: CHECKOUT });
    const { url, init, body } = sent(fn);
    expect(url).toBe(`${API}/changia/andrew-franciana/card`);
    expect(init.method).toBe('POST');
    expect(new Headers(init.headers).get('content-type')).toBe('application/json');
    expect(body).toEqual({ pledgeId: 'p1', amount: 50_000 });
  });

  it('leaves the amount out when none is given, so the API takes what is owed', async () => {
    const fn = answer(json({ status: 'checkout', checkoutUrl: CHECKOUT }, 202));
    await changiaCardCheckout(API, 'a b', { pledgeId: 'p1' });
    const { url, body } = sent(fn);
    expect(url).toBe(`${API}/changia/a%20b/card`);
    expect(body).toEqual({ pledgeId: 'p1' });
  });

  it('carries the refusal, with the balance the server holds', async () => {
    answer(
      json(
        { code: 'AMOUNT_ABOVE_OUTSTANDING', message: 'Only 30,000 TZS is still owed on this pledge', details: { outstanding: 30_000 } },
        409,
      ),
    );
    expect(await changiaCardCheckout(API, 's', { pledgeId: 'p1', amount: 50_000 })).toEqual({
      ok: false,
      status: 409,
      code: 'AMOUNT_ABOVE_OUTSTANDING',
      message: 'Only 30,000 TZS is still owed on this pledge',
      outstanding: 30_000,
    });
  });

  it('carries a refusal with no balance', async () => {
    answer(json({ code: 'CARD_NOT_OFFERED', message: 'Card payment is not available right now. Pay by mobile money.' }, 409));
    expect(await changiaCardCheckout(API, 's', { pledgeId: 'p1' })).toEqual({
      ok: false,
      status: 409,
      code: 'CARD_NOT_OFFERED',
      message: 'Card payment is not available right now. Pay by mobile money.',
    });
  });

  it('tolerates a refusal that is not JSON', async () => {
    answer(new Response('Bad Gateway', { status: 502 }));
    expect(await changiaCardCheckout(API, 's', { pledgeId: 'p1' })).toEqual({ ok: false, status: 502 });
  });

  it('reports a network failure as status 0', async () => {
    answer(new TypeError('Failed to fetch'));
    expect(await changiaCardCheckout(API, 's', { pledgeId: 'p1' })).toEqual({ ok: false, status: 0 });
  });

  it('refuses a checkout link that is not http(s)', async () => {
    answer(json({ status: 'checkout', checkoutUrl: 'javascript:alert(1)' }, 202));
    expect(await changiaCardCheckout(API, 's', { pledgeId: 'p1' })).toEqual({ ok: false, status: 202 });
  });

  it('refuses a checkout link that does not parse', async () => {
    answer(json({ status: 'checkout', checkoutUrl: 'not a url' }, 202));
    expect(await changiaCardCheckout(API, 's', { pledgeId: 'p1' })).toEqual({ ok: false, status: 202 });
  });
});

describe('inviteCardCheckout', () => {
  it('posts the amount with method card and no phone', async () => {
    const fn = answer(json({ reference: 'WBL-9X', status: 'checkout', checkoutUrl: CHECKOUT }, 202));
    const r = await inviteCardCheckout(API, 'tok/en', 100_000);
    expect(r).toEqual({ ok: true, checkoutUrl: CHECKOUT });
    const { url, init, body } = sent(fn);
    expect(url).toBe(`${API}/rsvp/tok%2Fen/contribute`);
    expect(init.method).toBe('POST');
    expect(body).toEqual({ amount: 100_000, method: 'card' });
  });

  it('treats a mobile money answer as a failure, not a checkout', async () => {
    answer(json({ reference: 'WBL-9X', status: 'pending' }, 202));
    expect(await inviteCardCheckout(API, 't', 100_000)).toEqual({ ok: false, status: 202 });
  });

  it('carries the refusal message', async () => {
    answer(json({ code: 'ACCOUNT_NOT_READY', message: 'This couple is not set up to take payments yet' }, 409));
    expect(await inviteCardCheckout(API, 't', 100_000)).toEqual({
      ok: false,
      status: 409,
      code: 'ACCOUNT_NOT_READY',
      message: 'This couple is not set up to take payments yet',
    });
  });

  it('reports a network failure as status 0', async () => {
    answer(new TypeError('Failed to fetch'));
    expect(await inviteCardCheckout(API, 't', 100_000)).toEqual({ ok: false, status: 0 });
  });
});

describe('goToCheckout', () => {
  it('sends the browser to the checkout with location.assign', () => {
    const assign = vi.fn();
    goToCheckout(CHECKOUT, { assign });
    expect(assign).toHaveBeenCalledWith(CHECKOUT);
  });
});
