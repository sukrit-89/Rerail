export type CampaignStatus = "draft" | "active" | "completed" | "expired";
export type RecipientStatus = "pending" | "claimed" | "expired";
export type TransactionType = "create_balance" | "claim" | "reclaim" | "sponsor_account";

export type Recipient = {
  id: string;
  campaignId: string;
  name: string;
  email?: string;
  walletAddress?: string;
  amount: string;
  claimableBalanceId?: string;
  claimLinkToken: string;
  status: RecipientStatus;
  claimedAt?: string;
  createdAt: string;
};

export type Campaign = {
  id: string;
  organizerId: string;
  name: string;
  token: string;
  issuer: string;
  amountPerRecipient: string;
  totalPool: string;
  deadline?: string;
  status: CampaignStatus;
  treasuryAddress?: string;
  createdAt: string;
};

export type LedgerTransaction = {
  id: string;
  recipientId: string;
  txHash: string;
  type: TransactionType;
  createdAt: string;
};

export type CsvRecipient = {
  name: string;
  email?: string;
  wallet_address?: string;
  amount?: string;
};
