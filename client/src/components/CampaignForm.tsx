"use client";

import { useState, useRef } from "react";
import { parseCSV, generateToken } from "@/lib/utils";
import { isValidStellarAddress } from "@/lib/stellar";
import { useFreighter } from "@/hooks/useFreighter";

interface RecipientRow {
  name: string;
  email: string;
  wallet: string;
}

export default function CampaignForm() {
  const { state: freighterState, requestAccess } = useFreighter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [amountPerRecipient, setAmountPerRecipient] = useState("");
  const [totalPool, setTotalPool] = useState("");
  const [deadline, setDeadline] = useState("");
  const [recipients, setRecipients] = useState<RecipientRow[]>([]);
  const [parsedCount, setParsedCount] = useState(0);
  const [invalidWallets, setInvalidWallets] = useState<string[]>([]);
  const [step, setStep] = useState<"form" | "preview" | "funding">("form");
  const [campaignToken, setCampaignToken] = useState("");

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const rows = parseCSV(text);
      setParsedCount(rows.length);
      setRecipients(rows);

      // Validate wallets
      const bad: string[] = [];
      for (const r of rows) {
        if (r.wallet && !isValidStellarAddress(r.wallet)) {
          bad.push(r.wallet);
        }
      }
      setInvalidWallets(bad);
    };
    reader.readAsText(file);
  };

  const handleNext = () => {
    const token = generateToken();
    setCampaignToken(token);
    setStep("preview");
  };

  const handleCreateCampaign = async () => {
    if (freighterState.status !== "connected") {
      await requestAccess();
      return;
    }

    setStep("funding");

    // The actual claimable balance creation happens here
    // This will be connected to the Stellar native operations
    // via the contract hook
  };

  const daysToDeadline = () => {
    if (!deadline) return 0;
    const d = new Date(deadline);
    const now = new Date();
    return Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  const totalAmount = recipients.reduce((sum, r) => {
    const amt = amountPerRecipient ? parseFloat(amountPerRecipient) : 0;
    return sum + amt;
  }, 0);

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-bold tracking-tight text-white">create campaign</h1>
      <p className="mt-1 text-sm text-zinc-400">set up a new USDC distribution campaign.</p>

      {step === "form" && (
        <div className="mt-8 space-y-6">
          {/* Campaign name */}
          <div>
            <label className="block text-sm font-medium text-zinc-300">campaign name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. hackathon prizes q3 2026"
              className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-[#22c55e] focus:outline-none"
            />
          </div>

          {/* Amount per recipient */}
          <div>
            <label className="block text-sm font-medium text-zinc-300">
              amount per recipient (USDC)
            </label>
            <input
              type="number"
              step="0.0000001"
              min="0"
              value={amountPerRecipient}
              onChange={(e) => setAmountPerRecipient(e.target.value)}
              placeholder="10"
              className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-[#22c55e] focus:outline-none"
            />
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-sm font-medium text-zinc-300">claim deadline</label>
            <input
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-[#22c55e] focus:outline-none"
            />
          </div>

          {/* CSV Upload */}
          <div>
            <label className="block text-sm font-medium text-zinc-300">
              recipients (CSV)
            </label>
            <p className="mt-1 text-xs text-zinc-500">
              columns: name, email, wallet_address (wallet is optional at upload)
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleCSVUpload}
              className="mt-2 block w-full text-sm text-zinc-400 file:mr-4 file:rounded-md file:border-0 file:bg-zinc-800 file:px-4 file:py-2 file:text-sm file:text-zinc-300 hover:file:bg-zinc-700"
            />
            {parsedCount > 0 && (
              <p className="mt-2 text-xs text-zinc-500">
                parsed {parsedCount} recipients
                {invalidWallets.length > 0 && (
                  <span className="ml-2 text-red-400">
                    · {invalidWallets.length} invalid wallet addresses
                  </span>
                )}
              </p>
            )}
          </div>

          {/* Recipient preview table */}
          {recipients.length > 0 && (
            <div className="overflow-x-auto rounded-md border border-zinc-800">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-zinc-800 bg-zinc-900">
                  <tr>
                    <th className="px-3 py-2 font-mono text-xs text-zinc-500">name</th>
                    <th className="px-3 py-2 font-mono text-xs text-zinc-500">wallet</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {recipients.slice(0, 10).map((r, i) => (
                    <tr key={i} className="text-zinc-300">
                      <td className="px-3 py-2">{r.name}</td>
                      <td className="px-3 py-2 font-mono text-xs text-zinc-500">
                        {r.wallet || "—"}
                      </td>
                    </tr>
                  ))}
                  {recipients.length > 10 && (
                    <tr className="text-zinc-500">
                      <td colSpan={2} className="px-3 py-2 text-center text-xs">
                        ...and {recipients.length - 10} more
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          <button
            onClick={handleNext}
            disabled={!name || !amountPerRecipient || recipients.length === 0}
            className="w-full rounded-md bg-[#22c55e] px-4 py-2.5 text-sm font-medium text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            preview campaign
          </button>
        </div>
      )}

      {step === "preview" && (
        <div className="mt-8 space-y-6">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <h2 className="text-lg font-medium text-white">{name}</h2>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-zinc-500">amount per recipient</p>
                <p className="font-mono text-sm text-white">{amountPerRecipient} USDC</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">total recipients</p>
                <p className="font-mono text-sm text-white">{recipients.length}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">total pool</p>
                <p className="font-mono text-sm text-white">{totalAmount} USDC</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">deadline</p>
                <p className="font-mono text-sm text-white">
                  {deadline ? `${daysToDeadline()} days` : "no deadline"}
                </p>
              </div>
            </div>
          </div>

          {freighterState.status !== "connected" ? (
            <button
              onClick={requestAccess}
              className="w-full rounded-md bg-[#22c55e] px-4 py-2.5 text-sm font-medium text-black transition-opacity hover:opacity-90"
            >
              connect wallet to continue
            </button>
          ) : (
            <button
              onClick={handleCreateCampaign}
              className="w-full rounded-md bg-[#22c55e] px-4 py-2.5 text-sm font-medium text-black transition-opacity hover:opacity-90"
            >
              fund & create campaign
            </button>
          )}

          <button
            onClick={() => setStep("form")}
            className="w-full text-sm text-zinc-500 underline underline-offset-2 hover:text-zinc-400"
          >
            back to edit
          </button>
        </div>
      )}

      {step === "funding" && (
        <div className="mt-8 flex flex-col items-center gap-4 py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-600 border-t-[#22c55e]" />
          <p className="text-sm text-zinc-400">creating claimable balances on Stellar...</p>
          <p className="text-xs text-zinc-600">
            sign the transaction in Freighter when prompted
          </p>
        </div>
      )}
    </div>
  );
}
