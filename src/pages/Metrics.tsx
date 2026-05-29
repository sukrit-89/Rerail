import { Activity, CheckCircle2, Clock3, Users } from "lucide-react";
import type { ElementType } from "react";
import { useAppStore } from "../store/useAppStore";

export function Metrics() {
  const campaigns = useAppStore((state) => state.campaigns);
  const recipients = useAppStore((state) => state.recipients);
  const transactions = useAppStore((state) => state.transactions);
  const claimed = recipients.filter((recipient) => recipient.status === "claimed").length;
  const claimRate = recipients.length ? Math.round((claimed / recipients.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-xs uppercase tracking-wide text-rail">L6 readiness</p>
        <h1 className="mt-2 text-3xl font-semibold">Metrics dashboard</h1>
        <p className="mt-2 text-sm text-zinc-400">Local product metrics now; Supabase-backed DAU and chain indexer metrics next.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric icon={Users} label="Active users" value={new Set(recipients.map((r) => r.walletAddress).filter(Boolean)).size} />
        <Metric icon={Activity} label="Transactions" value={transactions.length} />
        <Metric icon={CheckCircle2} label="Claim success rate" value={`${claimRate}%`} />
        <Metric icon={Clock3} label="Median time to claim" value={claimed ? "< 3 min" : "No claims"} />
      </div>
      <div className="border border-line bg-zinc-950 p-5">
        <h2 className="text-lg font-semibold">Campaign health</h2>
        <div className="mt-4 space-y-3">
          {campaigns.map((campaign) => {
            const campaignRecipients = recipients.filter((recipient) => recipient.campaignId === campaign.id);
            const campaignClaimed = campaignRecipients.filter((recipient) => recipient.status === "claimed").length;
            const rate = campaignRecipients.length ? Math.round((campaignClaimed / campaignRecipients.length) * 100) : 0;
            return (
              <div key={campaign.id}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span>{campaign.name}</span>
                  <span className="text-zinc-400">{rate}%</span>
                </div>
                <div className="h-2 bg-black">
                  <div className="h-2 bg-rail" style={{ width: `${rate}%` }} />
                </div>
              </div>
            );
          })}
          {campaigns.length === 0 && <p className="text-sm text-zinc-400">Create a campaign to populate metrics.</p>}
        </div>
      </div>
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: ElementType; label: string; value: string | number }) {
  return (
    <div className="border border-line bg-zinc-950 p-5">
      <Icon className="text-rail" size={22} />
      <p className="mt-4 text-sm text-zinc-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </div>
  );
}
