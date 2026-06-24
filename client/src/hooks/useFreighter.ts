"use client";

import { useState, useEffect, useCallback } from "react";
import { isFreighterInstalled, getFreighterAddress, isFreighterAllowed } from "@/lib/stellar";

export type FreighterState =
  | { status: "loading" }
  | { status: "not_installed" }
  | { status: "not_allowed" }
  | { status: "no_account" }
  | { status: "connected"; address: string };

export function useFreighter() {
  const [state, setState] = useState<FreighterState>({ status: "loading" });
  const [accountExists, setAccountExists] = useState(false);

  const checkConnection = useCallback(async () => {
    if (!isFreighterInstalled()) {
      setState({ status: "not_installed" });
      return;
    }

    try {
      const allowed = await isFreighterAllowed();
      if (!allowed) {
        setState({ status: "not_allowed" });
        return;
      }

      const address = await getFreighterAddress();
      setState({ status: "connected", address });

      // Check if the account is funded on testnet
      const { accountExists: ae } = await import("@/lib/stellar");
      const exists = await ae(address);
      setAccountExists(exists);
    } catch {
      setState({ status: "no_account" });
    }
  }, []);

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  const requestAccess = useCallback(async () => {
    const { requestAccess } = await import("@stellar/freighter-api");
    try {
      await requestAccess();
      await checkConnection();
    } catch (err) {
      console.error("Freighter access denied:", err);
    }
  }, [checkConnection]);

  return { state, accountExists, requestAccess, refresh: checkConnection };
}
