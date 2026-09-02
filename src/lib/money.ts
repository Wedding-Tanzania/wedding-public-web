/**
 * Money, written out in full.
 *
 * A separate copy from the couple app's on purpose: this repo deliberately
 * vendors its types rather than depending on @wedding/shared-types so it builds
 * standalone on Netlify, and taking that dependency to share four lines would
 * be the wrong trade. Two copies, one behaviour.
 *
 * The locale is explicit. Left off it follows whatever the browser is set to,
 * so the same figure could group differently on two guests' phones.
 */
export function tsh(n: number): string {
  return `TSh ${Math.round(n).toLocaleString('en-GB')}`;
}

/**
 * Group an amount as it is typed: "200000" reads back as "200,000".
 *
 * Digits only, so a paste with spaces is cleaned rather than rejected, and an
 * empty box stays empty instead of becoming a zero to delete.
 */
export function formatAmountInput(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits === '') return '';
  return Number(digits).toLocaleString('en-GB');
}

/** What that box actually means. Empty is 0, never NaN. */
export function parseAmountInput(raw: string): number {
  const digits = raw.replace(/\D/g, '');
  return digits === '' ? 0 : Number(digits);
}
