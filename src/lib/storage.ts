import type { Campaign, LedgerTransaction, Recipient } from "../types";

const STORAGE_KEY = "rerail:v1";

export type PersistedState = {
  campaigns: Campaign[];
  recipients: Recipient[];
  transactions: LedgerTransaction[];
};

export const emptyState: PersistedState = {
  campaigns: [],
  recipients: [],
  transactions: [],
};

export function loadState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState;
    const parsed = JSON.parse(raw) as PersistedState;
    return {
      campaigns: parsed.campaigns ?? [],
      recipients: parsed.recipients ?? [],
      transactions: parsed.transactions ?? [],
    };
  } catch {
    return emptyState;
  }
}

export function saveState(state: PersistedState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
