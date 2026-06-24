"use client";

import Link from "next/link";
import { useFreighter, FreighterState } from "@/hooks/useFreighter";
import { formatAddress } from "@/lib/utils";

export default function Navbar() {
  const { state, requestAccess } = useFreighter();

  return (
    <nav className="border-b border-zinc-800 bg-[#080808]">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-semibold tracking-tight text-white">
            rerail
          </span>
          <span className="rounded-full bg-[#22c55e]/10 px-2 py-0.5 text-xs text-[#22c55e]">
            gasless
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-sm text-zinc-400 transition-colors hover:text-white"
          >
            dashboard
          </Link>
          <Link
            href="/campaigns/new"
            className="text-sm text-zinc-400 transition-colors hover:text-white"
          >
            new campaign
          </Link>
          <WalletButton state={state} onConnect={requestAccess} />
        </div>
      </div>
    </nav>
  );
}

function WalletButton({
  state,
  onConnect,
}: {
  state: FreighterState;
  onConnect: () => void;
}) {
  if (state.status === "loading") {
    return (
      <div className="h-8 w-24 animate-pulse rounded-md bg-zinc-800" />
    );
  }

  if (state.status === "not_installed") {
    return (
      <a
        href="https://freighter.app"
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-md border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:border-zinc-500 hover:text-white"
      >
        install freighter
      </a>
    );
  }

  if (state.status === "not_allowed" || state.status === "no_account") {
    return (
      <button
        onClick={onConnect}
        className="rounded-md bg-[#22c55e] px-3 py-1.5 text-xs font-medium text-black transition-opacity hover:opacity-90"
      >
        connect wallet
      </button>
    );
  }

  return (
    <span className="rounded-md border border-zinc-700 px-3 py-1.5 font-mono text-xs text-[#22c55e]">
      {formatAddress(state.address)}
    </span>
  );
}
