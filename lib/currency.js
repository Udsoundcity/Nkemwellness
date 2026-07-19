/** Formats a raw numeric-ish value ("5000", "5,000", "₦5000", ...) as a
 * Naira amount with thousand separators, e.g. "₦5,000". Falls back to the
 * original string unchanged if it isn't numeric. */
export function formatNaira(value) {
  const numeric = Number(String(value).replace(/[^0-9.-]/g, ""));
  if (Number.isNaN(numeric)) return String(value);
  return "₦" + numeric.toLocaleString("en-NG");
}

/**
 * Formats one selection-field option for display.
 *
 * Admins can write an option two ways:
 *   - "25000"                    -> whole thing is the amount: "₦25,000"
 *   - "1 Pack of Tea|25000"      -> label + amount, split on "|":
 *                                    "1 Pack of Tea ₦25,000"
 *
 * The "|" form is what you want whenever an option has descriptive text
 * alongside a price — without it, digits embedded in the label (e.g. the
 * "1" in "1 Pack of Tea") would get swept into the number.
 */
export function formatOptionLabel(rawOption, useCurrency) {
  if (!useCurrency) return rawOption;

  const pipeIndex = rawOption.indexOf("|");
  if (pipeIndex !== -1) {
    const label = rawOption.slice(0, pipeIndex).trim();
    const amount = rawOption.slice(pipeIndex + 1).trim();
    return label ? `${label} ${formatNaira(amount)}` : formatNaira(amount);
  }

  return formatNaira(rawOption);
}

/** Parses a Naira amount back out of a submitted/displayed value, e.g.
 * "1 Pack of Tea ₦25,000" -> 25000. Returns null if no ₦ amount is found. */
export function parseNairaAmount(value) {
  if (value === null || value === undefined) return null;
  const match = String(value).match(/₦\s?([\d,]+(?:\.\d+)?)/);
  if (!match) return null;
  const numeric = Number(match[1].replace(/,/g, ""));
  return Number.isNaN(numeric) ? null : numeric;
}

/** Sums any ₦ amounts found in a submitted field value — handles both a
 * single string ("1 Pack of Tea ₦25,000") and an array from a
 * checkbox-group field where more than one priced option was selected. */
export function sumNairaAmounts(value) {
  const values = Array.isArray(value) ? value : [value];
  return values.reduce((sum, v) => sum + (parseNairaAmount(v) || 0), 0);
}