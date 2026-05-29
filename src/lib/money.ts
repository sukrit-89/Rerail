export function toNumber(value: string | number | undefined) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatAmount(value: string | number | undefined, token = "USDC") {
  return `${toNumber(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${token}`;
}

export function sumAmounts(values: Array<string | number | undefined>) {
  return values.reduce<number>((sum, value) => sum + toNumber(value), 0).toFixed(2);
}
