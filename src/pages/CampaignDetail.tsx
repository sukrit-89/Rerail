import { useMemo } from "react";
import type { ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { CheckCircle2, Copy, Download, ExternalLink, RotateCcw } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { downloadCsv, recipientsToCsv } from "../lib/csv";
import { explorerBase } from "../lib/stellar";
import { formatAmount } from "../lib/money";
import { StatusBadge } from "../components/StatusBadge";

const appUrl = import.meta.env.VITE_APP_URL ?? window.location.origin;

export function CampaignDetail() {
  const { id } = useParams();
  const campaign = useAppStore((state) => state.campaigns.find((item) => item.id === id));
  const recipients = useAppStore((state) => state.recipients.filter((recipient) => recipient.campaignId === id));
  const activateCampaign = useAppStore((state) => state.activateCampaign);
  const expireCampaign = useAppStore((state) => state.expireCampaign);

  const stats = useMemo(() => {
    const claimed = recipients.filter((recipient) => recipient.status === "claimed").length;
    return { claimed, pending: recipients.length - claimed, rate: recipients.length ? Math.round((claimed / recipients.length) * 100) : 0 };
  }, [recipients]);

  if (!campaign) {
    return (
      <div className="border border-line p-10">
        <h1 className="text-2xl font-semibold">Campaign not found</h1>
        <Link to="/" className="mt-4 inline-block text-rail">Back to dashboard</Link>
      </div>
    );
  }

  function copyLinks() {
    const text = recipients.map((recipient) => `${recipient.name},${appUrl}/claim/${recipient.claimLinkToken}`).join("\n");
    void navigator.clipboard.writeText(text);
  }

  function exportRows() {
    if (!campaign) return;
    downloadCsv(`${campaign.name.replace(/\W+/g, "-").toLowerCase()}-claims.csv`, recipientsToCsv(recipients, appUrl));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <p className="font-mono text-xs uppercase tracking-wide text-rail">Campaign</p>
          <h1 className="mt-2 text-3xl font-semibold">{campaign.name}</h1>
          <p className="mt-2 text-sm text-zinc-400">
            {formatAmount(campaign.totalPool, campaign.token)} reserved across {recipients.length} claim links.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={copyLinks} className="btn-secondary"><Copy size={16} /> Copy links</button>
          <button onClick={exportRows} className="btn-secondary"><Download size={16} /> Export CSV</button>
          {campaign.status === "draft" && (
            <button onClick={() => activateCampaign(campaign.id)} className="btn-primary"><CheckCircle2 size={16} /> Generate balances</button>
          )}
          {campaign.status !== "expired" && (
            <button onClick={() => expireCampaign(campaign.id)} className="btn-secondary"><RotateCcw size={16} /> Reclaim expired</button>
          )}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <Metric label="Status" value={<StatusBadge status={campaign.status} />} />
        <Metric label="Claimed" value={stats.claimed} />
        <Metric label="Pending" value={stats.pending} />
        <Metric label="Claim rate" value={`${stats.rate}%`} />
      </div>

      <div className="overflow-x-auto border border-line">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="bg-zinc-950 text-xs uppercase text-zinc-500">
            <tr>
              <th className="px-4 py-3">Recipient</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Wallet</th>
              <th className="px-4 py-3">Claim link</th>
              <th className="px-4 py-3">Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {recipients.map((recipient) => (
              <tr key={recipient.id} className="hover:bg-zinc-950/70">
                <td className="px-4 py-4">
                  <p className="font-medium">{recipient.name}</p>
                  <p className="text-xs text-zinc-500">{recipient.email || "No email"}</p>
                </td>
                <td className="px-4 py-4">{formatAmount(recipient.amount, campaign.token)}</td>
                <td className="px-4 py-4"><StatusBadge status={recipient.status} /></td>
                <td className="max-w-40 truncate px-4 py-4 font-mono text-xs text-zinc-400">{recipient.walletAddress || "On claim"}</td>
                <td className="px-4 py-4">
                  <Link className="inline-flex items-center gap-2 text-rail" to={`/claim/${recipient.claimLinkToken}`}>
                    Open <ExternalLink size={14} />
                  </Link>
                </td>
                <td className="max-w-56 truncate px-4 py-4 font-mono text-xs text-zinc-500">
                  {recipient.claimableBalanceId?.startsWith("demo") ? recipient.claimableBalanceId : (
                    recipient.claimableBalanceId ? (
                      <a href={`${explorerBase}/claimable-balance/${recipient.claimableBalanceId}`} className="text-rail">
                        {recipient.claimableBalanceId}
                      </a>
                    ) : "Generated on activation"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="border border-line bg-zinc-950 p-4">
      <p className="text-sm text-zinc-500">{label}</p>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
    </div>
  );
}
