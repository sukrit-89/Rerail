import { Link } from "react-router-dom";
import { ArrowRight, Download, Plus, Trash2 } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { StatusBadge } from "../components/StatusBadge";
import { formatAmount } from "../lib/money";

export function Dashboard() {
  const campaigns = useAppStore((state) => state.campaigns);
  const recipients = useAppStore((state) => state.recipients);
  const resetDemo = useAppStore((state) => state.resetDemo);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="font-mono text-xs uppercase tracking-wide text-rail">Gasless Stellar payouts</p>
          <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">Campaign dashboard</h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-400">
            Create USDC claim links, track recipients, and keep an auditable payout trail on Stellar testnet.
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/create" className="inline-flex items-center gap-2 rounded bg-rail px-4 py-2 text-sm font-semibold text-black">
            <Plus size={16} />
            New campaign
          </Link>
          <button
            onClick={resetDemo}
            className="inline-grid h-10 w-10 place-items-center rounded border border-line text-zinc-400 hover:text-white"
            title="Reset local demo data"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Metric label="Campaigns" value={campaigns.length} />
        <Metric label="Recipients" value={recipients.length} />
        <Metric label="Claim rate" value={`${recipients.length ? Math.round((recipients.filter((r) => r.status === "claimed").length / recipients.length) * 100) : 0}%`} />
      </div>

      {campaigns.length === 0 ? (
        <div className="border border-dashed border-line p-10 text-center">
          <h2 className="text-xl font-semibold">No campaigns yet</h2>
          <p className="mt-2 text-sm text-zinc-400">Upload a recipient CSV to generate the first batch of claim links.</p>
        </div>
      ) : (
        <div className="overflow-hidden border border-line">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-zinc-950 text-xs uppercase text-zinc-500">
              <tr>
                <th className="px-4 py-3">Campaign</th>
                <th className="px-4 py-3">Pool</th>
                <th className="px-4 py-3">Recipients</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3"><Download size={15} /></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {campaigns.map((campaign) => {
                const count = recipients.filter((recipient) => recipient.campaignId === campaign.id).length;
                return (
                  <tr key={campaign.id} className="hover:bg-zinc-950/70">
                    <td className="px-4 py-4 font-medium">{campaign.name}</td>
                    <td className="px-4 py-4">{formatAmount(campaign.totalPool, campaign.token)}</td>
                    <td className="px-4 py-4">{count}</td>
                    <td className="px-4 py-4"><StatusBadge status={campaign.status} /></td>
                    <td className="px-4 py-4 text-zinc-400">{new Date(campaign.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-4">
                      <Link to={`/campaign/${campaign.id}`} className="inline-flex items-center gap-2 text-rail">
                        Open <ArrowRight size={15} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border border-line bg-zinc-950 p-4">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}
