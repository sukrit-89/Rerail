import Papa from "papaparse";
import * as StellarSdk from "@stellar/stellar-sdk";
import type { CsvRecipient, Recipient } from "../types";

export type CsvParseResult = {
  rows: CsvRecipient[];
  errors: string[];
};

const clean = (value: unknown) => String(value ?? "").trim();

export function parseRecipientsCsv(file: File): Promise<CsvParseResult> {
  return new Promise((resolve) => {
    Papa.parse<Record<string, unknown>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const errors: string[] = [];
        const rows = result.data.map((row, index) => {
          const recipient = {
            name: clean(row.name),
            email: clean(row.email),
            wallet_address: clean(row.wallet_address),
            amount: clean(row.amount),
          };

          if (!recipient.name) errors.push(`Row ${index + 2}: name is required`);
          if (
            recipient.wallet_address &&
            !StellarSdk.StrKey.isValidEd25519PublicKey(recipient.wallet_address)
          ) {
            errors.push(`Row ${index + 2}: wallet_address is not a valid Stellar public key`);
          }
          if (recipient.amount && (!Number.isFinite(Number(recipient.amount)) || Number(recipient.amount) <= 0)) {
            errors.push(`Row ${index + 2}: amount must be a positive number`);
          }
          return recipient;
        });

        for (const error of result.errors) errors.push(error.message);
        resolve({ rows: rows.filter((row) => row.name), errors });
      },
      error: (error) => resolve({ rows: [], errors: [error.message] }),
    });
  });
}

export function recipientsToCsv(recipients: Recipient[], appUrl: string) {
  return Papa.unparse(
    recipients.map((recipient) => ({
      name: recipient.name,
      email: recipient.email ?? "",
      wallet_address: recipient.walletAddress ?? "",
      amount: recipient.amount,
      status: recipient.status,
      claim_url: `${appUrl}/claim/${recipient.claimLinkToken}`,
      claimable_balance_id: recipient.claimableBalanceId ?? "",
      claimed_at: recipient.claimedAt ?? "",
    })),
  );
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
