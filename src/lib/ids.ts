export function createId(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`;
}

export function createClaimToken() {
  return crypto.randomUUID();
}
