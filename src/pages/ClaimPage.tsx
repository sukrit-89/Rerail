import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Check, ExternalLink, ShieldCheck, Wallet } from "lucide-react";
import { useFreighter } from "../hooks/useFreighter";
import { useAppStore } from "../store/useAppStore";
import { explorerBase, networkPassphrase } from "../lib/stellar";
import { formatAmount } from "../lib/money";

export function ClaimPage() {
  const { token = "" } = useParams();
  const wallet = useFreighter();
  const recipient = useAppStore((state) => state.getRecipientByToken(token));
  const campaign = useAppStore((state) => state.campaigns.find((item) => item.id === recipient?.campaignId));
  const markClaimed = useAppStore((state) => state.markClaimed);
  const [claiming, setClaiming] = useState(false);
  const [txHash, setTxHash] = useState<string>();
  const alreadyClaimed = recipient?.status === "claimed";

  const claimText = useMemo(() => {
    if (!recipient || !campaign) return "Claim unavailable";
    if (alreadyClaimed) return "Already claimed";
    if (claiming) return "Claiming";
    return `Claim ${formatAmount(recipient.amount, campaign.token)}`;
  }, [alreadyClaimed, campaign, claiming, recipient]);

  async function claim() {
    if (!recipient || !campaign) return;
    setClaiming(true);
    try {
      const address = wallet.address ?? (await wallet.connect());
      const fakeHash = `demo-${crypto.randomUUID().split("-").join("")}`;
      markClaimed(token, address, fakeHash);
      setTxHash(fakeHash);
    } finally {
      setClaiming(false);
    }
  }

  if (!recipient || !campaign) {
    return (
      <div className="mx-auto max-w-xl border border-line bg-zinc-950 p-8">
        <h1 className="text-2xl font-semibold">Claim link not found</h1>
        <p className="mt-2 text-zinc-400">This token does not match any local campaign data.</p>
        <Link to="/" className="mt-5 inline-block text-rail">Back to dashboard</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="border border-line bg-zinc-950 p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-wide text-rail">Reserved for {recipient.name}</p>
            <h1 className="mt-3 text-4xl font-semibold">{formatAmount(recipient.amount, campaign.token)}</h1>
            <p className="mt-3 text-sm text-zinc-400">
              This payout is represented as a Stellar claimable balance. ReRail sponsors the claim fee.
            </p>
          </div>
          <ShieldCheck className="text-rail" size={34} />
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Info label="Campaign" value={campaign.name} />
          <Info label="Network" value={networkPassphrase === "Public Global Stellar Network ; September 2015" ? "Mainnet" : "Testnet"} />
          <Info label="Status" value={recipient.status} />
          <Info label="Balance ID" value={recipient.claimableBalanceId ?? "Created at activation"} mono />
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            disabled={alreadyClaimed || claiming}
            onClick={() => void claim()}
            className="btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {alreadyClaimed ? <Check size={17} /> : <Wallet size={17} />}
            {claimText}
          </button>
          <button onClick={() => void wallet.connect()} className="btn-secondary">
            <Wallet size={17} />
            {wallet.address ? "Wallet connected" : "Connect wallet"}
          </button>
        </div>

        {wallet.error && <p className="mt-4 text-sm text-red-200">{wallet.error}</p>}
        {(txHash || recipient.status === "claimed") && (
          <div className="mt-5 border border-rail/30 bg-rail/10 p-4 text-sm text-rail">
            <p className="font-semibold">Claim complete</p>
            <a className="mt-1 inline-flex items-center gap-2 break-all font-mono text-xs" href={`${explorerBase}/tx/${txHash ?? "demo"}`}>
              {txHash ?? "Recorded in local demo"} <ExternalLink size={13} />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

function Info({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="border border-line bg-black p-3">
      <p className="text-xs uppercase text-zinc-500">{label}</p>
      <p className={`mt-1 truncate text-sm ${mono ? "font-mono text-xs" : ""}`}>{value}</p>
    </div>
  );
}
