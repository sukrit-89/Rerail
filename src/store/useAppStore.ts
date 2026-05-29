import { create } from "zustand";
import type { Campaign, CsvRecipient, LedgerTransaction, Recipient } from "../types";
import { createClaimToken, createId } from "../lib/ids";
import { emptyState, loadState, saveState } from "../lib/storage";
import { defaultUsdcIssuer, makeMockBalanceId } from "../lib/stellar";
import { sumAmounts } from "../lib/money";

type CreateCampaignInput = {
  name: string;
  token: string;
  issuer: string;
  amountPerRecipient: string;
  deadline?: string;
  treasuryAddress?: string;
  recipients: CsvRecipient[];
};

type AppStore = {
  campaigns: Campaign[];
  recipients: Recipient[];
  transactions: LedgerTransaction[];
  createCampaign: (input: CreateCampaignInput) => string;
  activateCampaign: (campaignId: string) => void;
  markClaimed: (token: string, walletAddress: string, txHash?: string) => void;
  expireCampaign: (campaignId: string) => void;
  getCampaignRecipients: (campaignId: string) => Recipient[];
  getRecipientByToken: (token: string) => Recipient | undefined;
  resetDemo: () => void;
};

const persist = (state: Pick<AppStore, "campaigns" | "recipients" | "transactions">) => {
  saveState(state);
};

const initial = typeof window === "undefined" ? emptyState : loadState();

export const useAppStore = create<AppStore>((set, get) => ({
  ...initial,
  createCampaign: (input) => {
    const now = new Date().toISOString();
    const campaignId = createId("camp");
    const recipients: Recipient[] = input.recipients.map((row) => {
      const recipientId = createId("rec");
      return {
        id: recipientId,
        campaignId,
        name: row.name,
        email: row.email || undefined,
        walletAddress: row.wallet_address || undefined,
        amount: row.amount || input.amountPerRecipient,
        claimableBalanceId: row.wallet_address ? makeMockBalanceId(recipientId) : undefined,
        claimLinkToken: createClaimToken(),
        status: "pending",
        createdAt: now,
      };
    });
    const campaign: Campaign = {
      id: campaignId,
      organizerId: "local-demo-organizer",
      name: input.name,
      token: input.token || "USDC",
      issuer: input.issuer || defaultUsdcIssuer,
      amountPerRecipient: input.amountPerRecipient,
      totalPool: sumAmounts(recipients.map((recipient) => recipient.amount)),
      deadline: input.deadline || undefined,
      status: "draft",
      treasuryAddress: input.treasuryAddress || undefined,
      createdAt: now,
    };
    set((state) => {
      const next = {
        campaigns: [campaign, ...state.campaigns],
        recipients: [...recipients, ...state.recipients],
        transactions: state.transactions,
      };
      persist(next);
      return next;
    });
    return campaignId;
  },
  activateCampaign: (campaignId) =>
    set((state) => {
      const now = new Date().toISOString();
      const recipients = state.recipients.map((recipient) =>
        recipient.campaignId === campaignId
          ? {
              ...recipient,
              claimableBalanceId: recipient.claimableBalanceId ?? makeMockBalanceId(recipient.id),
            }
          : recipient,
      );
      const transactions: LedgerTransaction[] = [
        ...recipients
          .filter((recipient) => recipient.campaignId === campaignId)
          .map((recipient) => ({
            id: createId("tx"),
            recipientId: recipient.id,
            txHash: `demo-create-${recipient.claimLinkToken.slice(0, 8)}`,
            type: "create_balance" as const,
            createdAt: now,
          })),
        ...state.transactions,
      ];
      const next = {
        campaigns: state.campaigns.map((campaign) =>
          campaign.id === campaignId ? { ...campaign, status: "active" as const } : campaign,
        ),
        recipients,
        transactions,
      };
      persist(next);
      return next;
    }),
  markClaimed: (token, walletAddress, txHash) =>
    set((state) => {
      const now = new Date().toISOString();
      const recipient = state.recipients.find((item) => item.claimLinkToken === token);
      if (!recipient || recipient.status === "claimed") return state;
      const next = {
        campaigns: state.campaigns,
        recipients: state.recipients.map((item) =>
          item.claimLinkToken === token
            ? {
                ...item,
                walletAddress,
                status: "claimed" as const,
                claimedAt: now,
                claimableBalanceId: item.claimableBalanceId ?? makeMockBalanceId(item.id),
              }
            : item,
        ),
        transactions: [
          {
            id: createId("tx"),
            recipientId: recipient.id,
            txHash: txHash ?? `demo-claim-${token.slice(0, 8)}`,
            type: "claim" as const,
            createdAt: now,
          },
          ...state.transactions,
        ],
      };
      persist(next);
      return next;
    }),
  expireCampaign: (campaignId) =>
    set((state) => {
      const next = {
        campaigns: state.campaigns.map((campaign) =>
          campaign.id === campaignId ? { ...campaign, status: "expired" as const } : campaign,
        ),
        recipients: state.recipients.map((recipient) =>
          recipient.campaignId === campaignId && recipient.status === "pending"
            ? { ...recipient, status: "expired" as const }
            : recipient,
        ),
        transactions: state.transactions,
      };
      persist(next);
      return next;
    }),
  getCampaignRecipients: (campaignId) => get().recipients.filter((recipient) => recipient.campaignId === campaignId),
  getRecipientByToken: (token) => get().recipients.find((recipient) => recipient.claimLinkToken === token),
  resetDemo: () => {
    persist(emptyState);
    set(emptyState);
  },
}));
