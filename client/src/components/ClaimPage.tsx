"use client";

import { useState, useEffect, useCallback } from "react";
import { useFreighter } from "@/hooks/useFreighter";
import { checkRecipientStatus, gaslessClaim, addTrustline } from "@/hooks/contract";
import { formatAmount } from "@/lib/utils";

type ClaimState =
  | { phase: "loading" }
  | { phase: "no_freighter" }
  | { phase: "no_account" }
  | { phase: "no_trustline" }
  | { phase: "ready" }
  | { phase: "claiming" }
  | { phase: "claimed"; txHash: string }
  | { phase: "error"; message: string };

export default function ClaimPage({
  campaignName,
  amount,
  balanceId,
  token,
}: {
  campaignName: string;
  amount: string;
  balanceId: string;
  token: string;
}) {
  const { state: freighterState, requestAccess } = useFreighter();
  const [claimState, setClaimState] = useState<ClaimState>({ phase: "loading" });
  const [address, setAddress] = useState("");

  useEffect(() => {
    if (freighterState.status === "connected") {
      setAddress(freighterState.address);
    }
  }, [freighterState]);

  const evaluateState = useCallback(async () => {
    if (freighterState.status === "not_installed") {
      setClaimState({ phase: "no_freighter" });
      return;
    }
    if (freighterState.status === "loading") {
      setClaimState({ phase: "loading" });
      return;
    }
    if (freighterState.status !== "connected") {
      setClaimState({ phase: "loading" });
      return;
    }

    try {
      const status = await checkRecipientStatus(freighterState.address);
      if (!status.accountExists) {
        setClaimState({ phase: "no_account" });
      } else if (!status.hasTrustline) {
        setClaimState({ phase: "no_trustline" });
      } else {
        setClaimState({ phase: "ready" });
      }
    } catch {
      setClaimState({ phase: "error", message: "could not check account status" });
    }
  }, [freighterState]);

  useEffect(() => {
    evaluateState();
  }, [evaluateState]);

  const handleAddTrustline = async () => {
    try {
      setClaimState({ phase: "loading" });
      await addTrustline();
      // Re-evaluate
      const status = await checkRecipientStatus(address);
      if (status.hasTrustline) {
        setClaimState({ phase: "ready" });
      } else {
        setClaimState({ phase: "no_trustline" });
      }
    } catch (err: any) {
      setClaimState({ phase: "error", message: err.message || "trustline add failed" });
    }
  };

  const handleClaim = async () => {
    try {
      setClaimState({ phase: "claiming" });
      const txHash = await gaslessClaim(balanceId, address);
      setClaimState({ phase: "claimed", txHash });
    } catch (err: any) {
      setClaimState({ phase: "error", message: err.message || "claim failed" });
    }
  };

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 py-16">
      {/* Campaign badge */}
      <div className="mb-8 text-center">
        <p className="text-xs uppercase tracking-widest text-zinc-500">{campaignName}</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-white">
          {formatAmount(amount)} USDC
        </h1>
        <p className="mt-2 text-sm text-zinc-400">reserved for you</p>
      </div>

      {/* State machine */}
      <div className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 p-8">
        {claimState.phase === "loading" && (
          <div className="flex flex-col items-center gap-3 py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-600 border-t-[#22c55e]" />
            <p className="text-sm text-zinc-400">checking your wallet...</p>
          </div>
        )}

        {claimState.phase === "no_freighter" && (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <div className="text-3xl">🦊</div>
            <h2 className="text-lg font-medium text-white">install freighter</h2>
            <p className="text-sm text-zinc-400">
              you need the Freighter wallet extension to claim your USDC.
            </p>
            <ol className="space-y-2 text-left text-sm text-zinc-400">
              <li className="flex gap-2">
                <span className="font-mono text-[#22c55e]">1.</span>
                <span>go to{" "}
                  <a
                    href="https://freighter.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#22c55e] underline underline-offset-2"
                  >
                    freighter.app
                  </a>
                </span>
              </li>
              <li className="flex gap-2">
                <span className="font-mono text-[#22c55e]">2.</span>
                <span>add to chrome / firefox / brave</span>
              </li>
              <li className="flex gap-2">
                <span className="font-mono text-[#22c55e]">3.</span>
                <span>create a wallet or import existing</span>
              </li>
              <li className="flex gap-2">
                <span className="font-mono text-[#22c55e]">4.</span>
                <span>refresh this page</span>
              </li>
            </ol>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-md bg-[#22c55e] px-6 py-2 text-sm font-medium text-black transition-opacity hover:opacity-90"
            >
              refresh page
            </button>
          </div>
        )}

        {claimState.phase === "no_account" && (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <div className="text-3xl">🏦</div>
            <h2 className="text-lg font-medium text-white">create your Stellar account</h2>
            <p className="text-sm text-zinc-400">
              your Freighter wallet needs a Stellar account funded with a small XLM balance.
            </p>
            <p className="text-xs text-zinc-500">
              use the{" "}
              <a
                href="https://laboratory.stellar.org/#account-creator?network=testnet"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#22c55e] underline underline-offset-2"
              >
                Stellar lab
              </a>{" "}
              to create and fund your account on testnet, then refresh.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 rounded-md bg-[#22c55e] px-6 py-2 text-sm font-medium text-black transition-opacity hover:opacity-90"
            >
              check again
            </button>
          </div>
        )}

        {claimState.phase === "no_trustline" && (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <div className="text-3xl">🔗</div>
            <h2 className="text-lg font-medium text-white">add USDC trustline</h2>
            <p className="text-sm text-zinc-400">
              your wallet needs to trust USDC before you can receive it. one click, no XLM needed.
            </p>
            <button
              onClick={handleAddTrustline}
              className="rounded-md bg-[#22c55e] px-6 py-2 text-sm font-medium text-black transition-opacity hover:opacity-90"
            >
              add trustline
            </button>
          </div>
        )}

        {claimState.phase === "ready" && (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <div className="text-3xl">✅</div>
            <h2 className="text-lg font-medium text-white">ready to claim</h2>
            <p className="text-sm text-zinc-400">
              gasless claim via rerail fee sponsorship.
            </p>
            <button
              onClick={handleClaim}
              className="rounded-md bg-[#22c55e] px-8 py-3 text-sm font-medium text-black transition-opacity hover:opacity-90"
            >
              claim {formatAmount(amount)} USDC
            </button>
          </div>
        )}

        {claimState.phase === "claiming" && (
          <div className="flex flex-col items-center gap-3 py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-600 border-t-[#22c55e]" />
            <p className="text-sm text-zinc-400">submitting your claim...</p>
          </div>
        )}

        {claimState.phase === "claimed" && (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <div className="text-3xl">🎉</div>
            <h2 className="text-lg font-medium text-white">claimed successfully!</h2>
            <p className="text-sm text-zinc-400">
              {formatAmount(amount)} USDC is on its way to your wallet.
            </p>
            <a
              href={`https://stellar.expert/explorer/testnet/tx/${claimState.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-zinc-500 underline underline-offset-2 hover:text-[#22c55e]"
            >
              view on stellar.expert →
            </a>
          </div>
        )}

        {claimState.phase === "error" && (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <div className="text-3xl">⚠️</div>
            <h2 className="text-lg font-medium text-red-400">something went wrong</h2>
            <p className="text-sm text-zinc-400">{claimState.message}</p>
            <button
              onClick={evaluateState}
              className="rounded-md border border-zinc-700 px-6 py-2 text-sm text-zinc-400 transition-colors hover:border-zinc-500 hover:text-white"
            >
              try again
            </button>
          </div>
        )}
      </div>

      {/* Security note */}
      <p className="mt-6 text-center text-xs text-zinc-600">
        gasless claim powered by Stellar fee bump transactions.
        <br />
        your funds are secured by the Stellar network.
      </p>
    </div>
  );
}
