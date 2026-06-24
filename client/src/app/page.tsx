import Link from "next/link";

export default function Home() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col items-center px-4 pt-24 pb-32 text-center">
      {/* Hero */}
      <div className="mb-4 rounded-full bg-[#22c55e]/10 px-3 py-1 text-xs text-[#22c55e]">
        built on Stellar · gasless by design
      </div>
      <h1 className="text-5xl font-bold leading-tight tracking-tight text-white sm:text-6xl">
        gasless payouts
        <br />
        <span className="text-[#22c55e]">on Stellar</span>
      </h1>
      <p className="mt-6 max-w-xl text-lg leading-relaxed text-zinc-400">
        Organizations distribute USDC rewards, hackathon prizes, scholarships,
        and community grants through secure claim links. Recipients claim funds
        without ever holding XLM.
      </p>

      {/* CTA */}
      <div className="mt-10 flex gap-4">
        <Link
          href="/campaigns/new"
          className="rounded-md bg-[#22c55e] px-6 py-3 text-sm font-medium text-black transition-opacity hover:opacity-90"
        >
          start a campaign
        </Link>
        <Link
          href="/dashboard"
          className="rounded-md border border-zinc-700 px-6 py-3 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white"
        >
          dashboard
        </Link>
      </div>

      {/* How it works */}
      <div className="mt-24 grid grid-cols-1 gap-8 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 text-left">
          <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-[#22c55e]/10 text-sm font-bold text-[#22c55e]">
            1
          </div>
          <h3 className="font-medium text-white">create campaign</h3>
          <p className="mt-2 text-sm text-zinc-500">
            set pool size, per-recipient amount, and deadline. upload a CSV of
            recipients.
          </p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 text-left">
          <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-[#22c55e]/10 text-sm font-bold text-[#22c55e]">
            2
          </div>
          <h3 className="font-medium text-white">send claim links</h3>
          <p className="mt-2 text-sm text-zinc-500">
            each recipient gets a unique URL. funds are locked on-chain via
            Stellar Claimable Balances.
          </p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 text-left">
          <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-[#22c55e]/10 text-sm font-bold text-[#22c55e]">
            3
          </div>
          <h3 className="font-medium text-white">gasless claim</h3>
          <p className="mt-2 text-sm text-zinc-500">
            recipients click, connect Freighter, and claim. Fee Bump
            Transactions cover every claim.
          </p>
        </div>
      </div>

      {/* Trusted by note */}
      <p className="mt-16 text-xs text-zinc-600">
        powered by Stellar · testnet deployment · live on Vercel
      </p>
    </div>
  );
}
