export function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function formatAddress(addr: string): string {
  return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
}

export function formatAmount(amount: string): string {
  const num = parseFloat(amount);
  if (isNaN(num)) return amount;
  return num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 7 });
}

export function generateToken(): string {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  const hex = Array.from(arr)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

export function parseCSV(
  text: string
): { name: string; email: string; wallet: string }[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0].toLowerCase().split(",").map((h) => h.trim());
  const nameIdx = headers.indexOf("name");
  const emailIdx = headers.indexOf("email");
  const walletIdx = headers.indexOf("wallet") !== -1 ? headers.indexOf("wallet") : headers.indexOf("wallet_address");

  return lines
    .slice(1)
    .map((line) => {
      const cols = line.split(",").map((c) => c.trim());
      return {
        name: nameIdx >= 0 ? cols[nameIdx] || "" : "",
        email: emailIdx >= 0 ? cols[emailIdx] || "" : "",
        wallet: walletIdx >= 0 ? cols[walletIdx] || "" : "",
      };
    })
    .filter((r) => r.name || r.wallet);
}

export function getClaimUrl(token: string): string {
  if (typeof window === "undefined") return `/claim/${token}`;
  return `${window.location.origin}/claim/${token}`;
}
