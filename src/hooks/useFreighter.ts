import { useCallback, useEffect, useState } from "react";
import * as freighter from "@stellar/freighter-api";

type FreighterState = {
  connected: boolean;
  address?: string;
  network?: string;
  error?: string;
};

const unwrapAddress = (response: unknown) => {
  if (typeof response === "string") return response;
  if (response && typeof response === "object" && "address" in response) {
    return String((response as { address: string }).address);
  }
  return undefined;
};

const unwrapNetwork = (response: unknown) => {
  if (typeof response === "string") return response;
  if (response && typeof response === "object" && "network" in response) {
    return String((response as { network: string }).network);
  }
  return undefined;
};

export function useFreighter() {
  const [state, setState] = useState<FreighterState>({ connected: false });

  const refresh = useCallback(async () => {
    try {
      const connectedResult = await freighter.isConnected();
      const installed =
        typeof connectedResult === "boolean" ? connectedResult : Boolean((connectedResult as { isConnected?: boolean }).isConnected);
      if (!installed) return setState({ connected: false, error: "Freighter is not installed." });

      const allowedResult = await freighter.isAllowed();
      const allowed =
        typeof allowedResult === "boolean" ? allowedResult : Boolean((allowedResult as { isAllowed?: boolean }).isAllowed);
      if (!allowed) return setState({ connected: false });

      const address = unwrapAddress(await freighter.getAddress());
      const network = unwrapNetwork(await freighter.getNetwork());
      setState({ connected: Boolean(address), address, network });
    } catch (error) {
      setState({ connected: false, error: error instanceof Error ? error.message : "Wallet check failed." });
    }
  }, []);

  const connect = useCallback(async () => {
    await freighter.requestAccess();
    await refresh();
    const address = unwrapAddress(await freighter.getAddress());
    if (!address) throw new Error("Freighter did not return an address.");
    return address;
  }, [refresh]);

  const sign = useCallback(async (xdr: string, networkPassphrase: string) => {
    const signed = await freighter.signTransaction(xdr, { networkPassphrase });
    if (typeof signed === "string") return signed;
    return (signed as { signedTxXdr: string }).signedTxXdr;
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { ...state, connect, refresh, sign };
}
