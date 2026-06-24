import { NextRequest, NextResponse } from "next/server";
import {
  Transaction,
  TransactionBuilder,
  BASE_FEE,
  Keypair,
  Networks,
  rpc,
} from "@stellar/stellar-sdk";

const FEE_PAYER_SECRET = process.env.FEE_PAYER_SECRET;
const RPC_URL = "https://soroban-testnet.stellar.org";
const NETWORK_PASSPHRASE = Networks.TESTNET;

export async function POST(request: NextRequest) {
  // Rate limiting check would go here in production
  try {
    const { signedInnerXdr } = await request.json();

    if (!signedInnerXdr || typeof signedInnerXdr !== "string") {
      return NextResponse.json(
        { error: "signedInnerXdr is required" },
        { status: 400 }
      );
    }

    if (!FEE_PAYER_SECRET) {
      return NextResponse.json(
        { error: "fee payer not configured" },
        { status: 500 }
      );
    }

    // Parse the inner transaction
    const innerTx = new Transaction(signedInnerXdr, NETWORK_PASSPHRASE);
    const feePayerKp = Keypair.fromSecret(FEE_PAYER_SECRET);

    // Build fee bump transaction
    const feeBumpTx = TransactionBuilder.buildFeeBumpTransaction(
      feePayerKp,
      BASE_FEE,
      innerTx,
      NETWORK_PASSPHRASE
    );

    // Sign with fee payer
    feeBumpTx.sign(feePayerKp);

    // Submit to network
    const server = new rpc.Server(RPC_URL);
    const result = await server.sendTransaction(feeBumpTx);

    if (result.status === "PENDING" || result.status === "DUPLICATE") {
      // Wait for confirmation
      const txResult = await server.getTransaction(result.hash);
      if (txResult.status === "SUCCESS") {
        return NextResponse.json({
          txHash: result.hash,
          status: "success",
        });
      }
    }

    return NextResponse.json({
      txHash: result.hash,
      status: result.status,
      error: result.errorResult?.toString() || "unknown error",
    });
  } catch (err: any) {
    console.error("Fee bump claim error:", err);
    return NextResponse.json(
      { error: err.message || "claim execution failed" },
      { status: 500 }
    );
  }
}
