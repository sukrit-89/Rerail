import { type FormEvent, type ReactNode, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileUp, Rocket, Wallet } from "lucide-react";
import type { CsvRecipient } from "../types";
import { parseRecipientsCsv } from "../lib/csv";
import { defaultUsdcIssuer } from "../lib/stellar";
import { formatAmount, sumAmounts } from "../lib/money";
import { useAppStore } from "../store/useAppStore";

export function CreateCampaign() {
  const navigate = useNavigate();
  const createCampaign = useAppStore((state) => state.createCampaign);
  const [name, setName] = useState("Hackathon prize run");
  const [token, setToken] = useState("USDC");
  const [issuer, setIssuer] = useState(defaultUsdcIssuer);
  const [amount, setAmount] = useState("50");
  const [deadline, setDeadline] = useState("");
  const [treasuryAddress, setTreasuryAddress] = useState("");
  const [rows, setRows] = useState<CsvRecipient[]>(sampleRows);
  const [errors, setErrors] = useState<string[]>([]);

  const total = useMemo(() => sumAmounts(rows.map((row) => row.amount || amount)), [amount, rows]);
  const xlmReserve = (rows.length * 0.6 + 1).toFixed(2);

  async function onFile(file?: File) {
    if (!file) return;
    const result = await parseRecipientsCsv(file);
    setRows(result.rows);
    setErrors(result.errors);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim() || rows.length === 0) return;
    const campaignId = createCampaign({
      name,
      token,
      issuer,
      amountPerRecipient: amount,
      deadline,
      treasuryAddress,
      recipients: rows,
    });
    navigate(`/campaign/${campaignId}`);
  }

  return (
    <form onSubmit={submit} className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <section className="space-y-6">
        <div>
          <p className="font-mono text-xs uppercase tracking-wide text-rail">Create campaign</p>
          <h1 className="mt-2 text-3xl font-semibold">Set up claimable payouts</h1>
        </div>

        <div className="grid gap-4 border border-line bg-zinc-950 p-5 sm:grid-cols-2">
          <Field label="Campaign name">
            <input value={name} onChange={(e) => setName(e.target.value)} className="input" required />
          </Field>
          <Field label="Default amount">
            <input value={amount} onChange={(e) => setAmount(e.target.value)} className="input" inputMode="decimal" required />
          </Field>
          <Field label="Token">
            <input value={token} onChange={(e) => setToken(e.target.value.toUpperCase())} className="input" required />
          </Field>
          <Field label="Deadline">
            <input value={deadline} onChange={(e) => setDeadline(e.target.value)} className="input" type="datetime-local" />
          </Field>
          <Field label="Issuer public key">
            <input value={issuer} onChange={(e) => setIssuer(e.target.value)} className="input font-mono text-xs" required />
          </Field>
          <Field label="Treasury address">
            <input value={treasuryAddress} onChange={(e) => setTreasuryAddress(e.target.value)} className="input font-mono text-xs" placeholder="Optional" />
          </Field>
        </div>

        <div className="border border-line bg-zinc-950 p-5">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-semibold">Recipients CSV</h2>
              <p className="mt-1 text-sm text-zinc-400">Columns: name, email, wallet_address, amount. Amount and wallet are optional.</p>
            </div>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded border border-line px-3 py-2 text-sm text-zinc-200 hover:border-rail">
              <FileUp size={16} />
              Upload CSV
              <input type="file" accept=".csv,text/csv" onChange={(e) => void onFile(e.target.files?.[0])} className="hidden" />
            </label>
          </div>

          {errors.length > 0 && (
            <div className="mt-4 border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-100">
              {errors.slice(0, 5).map((error) => <p key={error}>{error}</p>)}
            </div>
          )}

          <div className="mt-4 overflow-x-auto border border-line">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-black text-xs uppercase text-zinc-500">
                <tr>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Wallet</th>
                  <th className="px-3 py-2">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((row, index) => (
                  <tr key={`${row.email}-${index}`}>
                    <td className="px-3 py-3">{row.name}</td>
                    <td className="px-3 py-3 text-zinc-400">{row.email}</td>
                    <td className="max-w-44 truncate px-3 py-3 font-mono text-xs text-zinc-400">{row.wallet_address || "Collect on claim"}</td>
                    <td className="px-3 py-3">{formatAmount(row.amount || amount, token)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <aside className="h-fit border border-line bg-zinc-950 p-5">
        <h2 className="text-lg font-semibold">Funding preview</h2>
        <div className="mt-4 space-y-3 text-sm">
          <Preview label="Recipients" value={rows.length} />
          <Preview label="Total pool" value={formatAmount(total, token)} />
          <Preview label="Estimated XLM buffer" value={`${xlmReserve} XLM`} />
          <Preview label="Network" value="Stellar testnet" />
        </div>
        <button className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded bg-rail px-4 py-3 font-semibold text-black">
          <Rocket size={17} />
          Create campaign
        </button>
        <p className="mt-4 flex gap-2 text-xs text-zinc-500">
          <Wallet className="mt-0.5 shrink-0" size={15} />
          Real funding transactions are signed from the organizer wallet; this MVP stores campaign state locally until Supabase is connected.
        </p>
      </aside>
    </form>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="space-y-2 text-sm text-zinc-400">
      <span>{label}</span>
      {children}
    </label>
  );
}

function Preview({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between border-b border-line pb-3">
      <span className="text-zinc-500">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

const sampleRows: CsvRecipient[] = [
  { name: "Asha Rao", email: "asha@example.com", amount: "75" },
  { name: "Diego Kim", email: "diego@example.com", amount: "50" },
  { name: "Mina Shah", email: "mina@example.com", amount: "100" },
];
