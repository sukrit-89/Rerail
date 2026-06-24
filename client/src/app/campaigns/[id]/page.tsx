"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

export default function CampaignDetailPage() {
  const params = useParams<{ id: string }>();
  const [showLinks, setShowLinks] = useState(false);

  // Placeholder — will be fetched from on-chain
  const campaign = {
    id: params.id,
    name: "Hackathon Q3 Prizes",
    status: "active",
    amountPerRecipient: "100",
    totalRecipients: 12,
    claimedCount: 7,
    deadline: "2026-07-15",
    recipients: [
      { name: "Alice", wallet: "GABCD...1234", status: "claimed" },
      { name: "Bob", wallet: "GXYZ...5678", status: "claimed" },
      { name: "Charlie", wallet: "G123...ABCD", status: "pending" },
    ],
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-zinc-500">campaign</p>
          <h1 className="text-2xl font-bold tracking-tight text-white">{campaign.name}</h1>
        </div>
        <span className="rounded-full bg-[#22c55e]/10 px-3 py-1 text-xs font-medium text-[#22c55e]">
          {campaign.status}
        </span>
      </div>

      {/* Overview */}
      <div className="mt-8 grid grid-cols-4 gap-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <p className="text-xs text-zinc-500">amount / recipient</p>
          <p className="mt-1 font-mono text-lg font-bold text-white">{campaign.amountPerRecipient} USDC</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <p className="text-xs text-zinc-500">recipients</p>
          <p className="mt-1 font-mono text-lg font-bold text-white">{campaign.totalRecipients}</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <p className="text-xs text-zinc-500">claimed</p>
          <p className="mt-1 font-mono text-lg font-bold text-[#22c55e]">{campaign.claimedCount}</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <p className="text-xs text-zinc-500">deadline</p>
          <p className="mt-1 font-mono text-lg font-bold text-white">{campaign.deadline}</p>
        </div>
      </div>

      {/* Recipients table */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-zinc-300">recipients</h2>
          <button
            onClick={() => setShowLinks(!showLinks)}
            className="rounded-md border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:border-zinc-500 hover:text-white"
          >
            {showLinks ? "hide links" : "show claim links"}
          </button>
        </div>

        <div className="mt-4 overflow-x-auto rounded-md border border-zinc-800">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-800 bg-zinc-900">
              <tr>
                <th className="px-4 py-3 font-mono text-xs text-zinc-500">name</th>
                <th className="px-4 py-3 font-mono text-xs text-zinc-500">wallet</th>
                <th className="px-4 py-3 font-mono text-xs text-zinc-500">status</th>
                {showLinks && <th className="px-4 py-3 font-mono text-xs text-zinc-500">claim link</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {campaign.recipients.map((r, i) => (
                <tr key={i} className="text-zinc-300">
                  <td className="px-4 py-3">{r.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-zinc-500">{r.wallet}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        r.status === "claimed"
                          ? "bg-[#22c55e]/10 text-[#22c55e]"
                          : "bg-zinc-800 text-zinc-400"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  {showLinks && (
                    <td className="px-4 py-3 font-mono text-xs text-zinc-600">
                      /claim/{campaign.id}-{i}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
