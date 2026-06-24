import { NextRequest, NextResponse } from "next/server";
import { Horizon } from "@stellar/stellar-sdk";

const HORIZON_URL = "https://horizon-testnet.stellar.org";

export async function POST(request: NextRequest) {
  try {
    const { txHash, recipientCount } = await request.json();

    if (!txHash) {
      return NextResponse.json(
        { error: "txHash is required" },
        { status: 400 }
      );
    }

    const horizonServer = new Horizon.Server(HORIZON_URL);

    // Fetch effects for the transaction
    const effects = await horizonServer
      .effects()
      .forTransaction(txHash)
      .call();

    // Extract claimable_balance_created effects in order
    const balanceIds = effects.records
      .filter((e: any) => e.type === "claimable_balance_created")
      .map((e: any) => e.balance_id);

    return NextResponse.json({
      balanceIds,
      count: balanceIds.length,
      expected: recipientCount || null,
    });
  } catch (err: any) {
    console.error("Campaign sync error:", err);
    return NextResponse.json(
      { error: err.message || "sync failed" },
      { status: 500 }
    );
  }
}
