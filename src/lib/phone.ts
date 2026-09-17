/**
 * Tanzanian subscriber numbers.
 *
 * A deliberate copy of `normalizeTzPhone` from `@wedding/shared-types`, which
 * is the source of truth and is the one under test (wedding-api's
 * tests/util/phone.spec.ts). This app is built standalone on Netlify with no
 * sibling checkout, the same reason tokens.json is vendored, so a `file:`
 * dependency on the shared package would break its deploy, and importing the
 * package's barrel would pull yup into a marketing bundle for twenty lines of
 * arithmetic.
 *
 * Nothing enforces that these two stay in step. If you change the rule, change
 * it in both, and prefer changing the shared one first.
 *
 * Subscriber numbers only. Never use on a lipa namba or a changisha number.
 */
const SUBSCRIBER = /^[67]\d{8}$/;

export function normalizeTzPhone(input: string | null | undefined): string | null {
  if (input === null || input === undefined) return null;
  let d = String(input).replace(/\D/g, '');
  if (d.length === 0) return null;
  if (d.startsWith('255')) d = d.slice(3);
  if (d.startsWith('0')) d = d.slice(1);
  return SUBSCRIBER.test(d) ? `+255${d}` : null;
}

/** The nine digits the +255 prefix does not already stand for. */
export function localDigits(value: string | null | undefined): string {
  if (value === null || value === undefined) return '';
  const e164 = normalizeTzPhone(value);
  if (e164 !== null) return e164.slice(4);
  let d = String(value).replace(/\D/g, '');
  if (d.startsWith('255')) d = d.slice(3);
  if (d.startsWith('0')) d = d.slice(1);
  return d.slice(0, 9);
}

/** "755 123 456" while typing. */
export function formatLocal(digits: string): string {
  return [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 9)]
    .filter((part) => part.length > 0)
    .join(' ');
}

export const TZ_PHONE_MESSAGE =
  'Enter a Tanzanian mobile number, for example 755 123 456';
