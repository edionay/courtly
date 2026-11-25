export function parseDollarPriceToCents(priceInput: string): number {
  const trimmed = priceInput.trim();
  if (!trimmed) {
    return 0;
  }

  const parts = trimmed.split(".");
  if (parts.length > 2) {
    return Number.NaN;
  }

  const dollarsPart = parts[0];
  const centsPart = parts.length === 2 ? parts[1] : "";

  const isDollarsValid = /^\d+$/.test(dollarsPart);
  if (!isDollarsValid) {
    return Number.NaN;
  }

  const isCentsLengthValid = centsPart.length <= 2;
  const isCentsDigitsValid = centsPart.length === 0 || /^\d+$/.test(centsPart);
  if (!isCentsLengthValid || !isCentsDigitsValid) {
    return Number.NaN;
  }

  const dollars = parseInt(dollarsPart, 10);
  const normalizedCentsString = (centsPart + "00").slice(0, 2);
  const cents = parseInt(normalizedCentsString, 10);

  return dollars * 100 + cents;
}
