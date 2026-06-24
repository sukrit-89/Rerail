"use client";

import { useState, useEffect } from "react";
import { useFreighter } from "@/hooks/useFreighter";
import { formatAddress, formatAmount, getClaimUrl } from "@/lib/utils";

interface Campaign {
  id: string;
  name: string;
  amountPerRecipient: string;
  totalRecipients: number;
  claimedCount: number;
  deadline: string;
  status: "active" | "completed" | "expired";
  token: string;
}

// Placeholder campaigns — will be fetched from on-chain / Supabase
const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: "1",
    name: "Hackathon Q3 Prizes",
    amountPerRecipient: "100",
    totalRecipients: 12,
    claimedCount: 7,
    deadline: "2026-07-15T00:00:00Z",
    status: "active",
    token: "abc123",
  },
  {
    id: "2",
    name: "Community Rewards",
    amountPerRecipient: "50",
    totalRecipients: 25,
    claimedCount: 25,
    deadline: "2026-05-01T00:00:00Z",
    status: "completed",
    token: "def456",
  },
];

export default function Dashboard() {
  const { state } = useFreighter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [showExport, setShowExport] = useState<string | null>(null);

  useEffect(() => {
    // Will be replaced with on-chain data + Supabase
    setCampaigns(MOCK_CAMPAIGNS);
  }, []);

  const totalClaimed = campaigns.reduce((s, c) => s + c.claimedCount, 0);
  const totalRecipients = campaigns.reduce((s, c) => s + c.totalRecipients, 0);
  const claimRate = totalRecipients > 0 ? Math.round((totalClaimed / totalRecipients) * 100) : 0;

  if (state.status !== "connected") {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 text-center">
        <h2 className="text-lg font-medium text-white">connect wallet to view dashboard</h2>
        <p className="mt-2 text-sm text-zinc-400">
          your campaigns and claim status will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">dashboard</h1>
          <p className="mt-1 text-sm text-zinc-400">
            connected as{" "}
            <span className="font-mono text-[#22c55e]">{formatAddress(state.address)}</span>
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-8 grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <p className="text-xs text-zinc-500">campaigns</p>
          <p className="mt-1 text-2xl font-bold text-white">{campaigns.length}</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <p className="text-xs text-zinc-500">claim rate</p>
          <p className="mt-1 text-2xl font-bold text-[#22c55e]">{claimRate}%</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <p className="text-xs text-zinc-500">claimed / total</p>
          <p className="mt-1 text-2xl font-bold text-white">
            {totalClaimed}/{totalRecipients}
          </p>
        </div>
      </div>

      {/* Campaign list */}
      <div className="mt-8 space-y-4">
        <h2 className="text-sm font-medium text-zinc-300">your campaigns</h2>

        {campaigns.length === 0 && (
          <div className="rounded-xl border border-dashed border-zinc-800 p-12 text-center">
            <p className="text-sm text-zinc-500">no campaigns yet.</p>
            <a
              href="/campaigns/new"
              className="mt-2 inline-block text-sm text-[#22c55e] underline underline-offset-2"
            >
              create your first campaign
            </a>
          </div>
        )}

        {campaigns.map((camp) => (
          <div
            key={camp.id}
            className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium text-white">{camp.name}</h3>
                <p className="mt-1 font-mono text-sm text-zinc-400">
                  {camp.amountPerRecipient} USDC each · {camp.totalRecipients} recipients
                </p>
              </div>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  camp.status === "active"
                    ? "bg-[#22c55e]/10 text-[#22c55e]"
                    : camp.status === "completed"
                      ? "bg-zinc-800 text-zinc-400"
                      : "bg-red-900/20 text-red-400"
                }`}
              >
                {camp.status}
              </span>
            </div>

            {/* Progress bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-zinc-500">
                <span>
                  {camp.claimedCount}/{camp.totalRecipients} claimed
                </span>
                <span>{Math.round((camp.claimedCount / camp.totalRecipients) * 100)}%</span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full rounded-full bg-[#22c55e] transition-all"
                  style={{
                    width: `${(camp.claimedCount / camp.totalRecipients) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => setShowExport(showExport === camp.id ? null : camp.id)}
                className="rounded-md border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:border-zinc-500 hover:text-white"
              >
                {showExport === camp.id ? "hide links" : "claim links"}
              </button>
              <button className="rounded-md border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:border-zinc-500 hover:text-white">
                export csv
              </button>
              {camp.status === "expired" && (
                <button className="rounded-md bg-red-900/20 px-3 py-1.5 text-xs text-red-400 transition-colors hover:bg-red-900/40">
                  reclaim unclaimed
                </button>
              )}
            </div>

            {/* Claim links (expandable) */}
            {showExport === camp.id && (
              <div className="mt-3 rounded-md border border-zinc-800 bg-zinc-950 p-3">
                <p className="mb-2 text-xs text-zinc-500">claim links:</p>
                {Array.from({ length: camp.totalRecipients }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 py-1 font-mono text-xs text-zinc-400"
                  >
                    <span>recipient {i + 1}:</span>
                    <span className="text-zinc-600">
                      {getClaimUrl(`${camp.token}-${i}`)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
