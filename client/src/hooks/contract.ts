"use client";

// This file will be updated with generated bindings once a contract address is provided.
// For now, we provide a scaffold for Stellar native operations (Claimable Balances, Fee Bump).

import {
  getFreighterAddress,
  signTxWithFreighter,
  buildCreateBalancesTx,
  buildClaimBalanceTx,
  buildFeeBumpTransaction,
  hasTrustline,
  accountExists,
  NETWORK_PASSPHRASE,
  horizonServer,
} from "@/lib/stellar";
import { Transaction } from "@stellar/stellar-sdk";
import type { RecipientInput } from "@/lib/stellar";

export const CONTRACT_ADDRESS = ""; // Will be set after deployment

// --- Soroban Contract Calls (will be replaced by generated bindings) ---

export async function createCampaignOnChain(
  organizer: string,
  campaignId: string,
  amountPerRecipient: number,
  deadline: number
) {
  // This will use the generated contract client after bindings are generated.
  // For now, it's a placeholder.
  console.log("createCampaignOnChain:", { organizer, campaignId, amountPerRecipient, deadline });
}

export async function getCampaignFromChain(campaignId: string) {
  // Placeholder for generated binding
  console.log("getCampaignFromChain:", campaignId);
  return null;
}

// --- Stellar Native Operations ---

export async function createClaimableBalances(
  recipients: RecipientInput[]
): Promise<string> {
  const source = await getFreighterAddress();
  const tx = await buildCreateBalancesTx(source, recipients);
  const signedXdr = await signTxWithFreighter(tx.toXDR());
  // Submit to Horizon
  const txObj = new Transaction(signedXdr, NETWORK_PASSPHRASE);
  const result = await horizonServer.submitTransaction(txObj, { skipMemoRequiredCheck: true });
  return result.hash;
}

export async function claimBalance(
  balanceId: string
): Promise<string> {
  const source = await getFreighterAddress();
  const tx = await buildClaimBalanceTx(source, balanceId);
  const signedXdr = await signTxWithFreighter(tx.toXDR());
  const txObj = new Transaction(signedXdr, NETWORK_PASSPHRASE);
  const result = await horizonServer.submitTransaction(txObj, { skipMemoRequiredCheck: true });
  return result.hash;
}

export async function gaslessClaim(
  balanceId: string,
  userAddress: string
): Promise<string> {
  // Build the claim tx, sign with user, send to server for fee bump
  const tx = await buildClaimBalanceTx(userAddress, balanceId);
  const signedXdr = await signTxWithFreighter(tx.toXDR());

  const response = await fetch("/api/claim/execute", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ signedInnerXdr: signedXdr }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || "Claim failed");
  }

  const data = await response.json();
  return data.txHash;
}

export async function checkRecipientStatus(address: string): Promise<{
  accountExists: boolean;
  hasTrustline: boolean;
}> {
  const [ae, ht] = await Promise.all([
    accountExists(address),
    hasTrustline(address),
  ]);
  return { accountExists: ae, hasTrustline: ht };
}

// --- Trustline Management ---

export async function addTrustline(): Promise<string> {
  const source = await getFreighterAddress();
  const { USDC_ASSET, NETWORK_PASSPHRASE, horizonServer } = await import("@/lib/stellar");
  const { TransactionBuilder, Operation, BASE_FEE } = await import("@stellar/stellar-sdk");
  const sourceAccount = await horizonServer.loadAccount(source);

  const tx = new TransactionBuilder(sourceAccount, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(Operation.changeTrust({ asset: USDC_ASSET }))
    .setTimeout(30)
    .build();

  const signedXdr = await signTxWithFreighter(tx.toXDR());
  const txObj = new Transaction(signedXdr, NETWORK_PASSPHRASE);
  const result = await horizonServer.submitTransaction(txObj, { skipMemoRequiredCheck: true });
  return result.hash;
}
