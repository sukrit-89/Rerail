import type { CampaignStatus, RecipientStatus } from "../types";

const styles: Record<CampaignStatus | RecipientStatus, string> = {
  draft: "border-zinc-700 bg-zinc-900 text-zinc-300",
  active: "border-rail/40 bg-rail/10 text-rail",
  completed: "border-blue-400/40 bg-blue-400/10 text-blue-200",
  pending: "border-amber-400/40 bg-amber-400/10 text-amber-200",
  claimed: "border-rail/40 bg-rail/10 text-rail",
  expired: "border-red-400/40 bg-red-400/10 text-red-200",
};

export function StatusBadge({ status }: { status: CampaignStatus | RecipientStatus }) {
  return (
    <span className={`inline-flex rounded border px-2 py-1 text-xs font-medium capitalize ${styles[status]}`}>
      {status}
    </span>
  );
}
