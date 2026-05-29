import type { IncomingMessage, ServerResponse } from "node:http";
import * as StellarSdk from "@stellar/stellar-sdk";

const network = process.env.VITE_STELLAR_NETWORK === "mainnet" ? "mainnet" : "testnet";
const networkPassphrase = network === "mainnet" ? StellarSdk.Networks.PUBLIC : StellarSdk.Networks.TESTNET;
const horizonUrl = network === "mainnet" ? "https://horizon.stellar.org" : "https://horizon-testnet.stellar.org";

async function readBody(req: IncomingMessage) {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  return JSON.parse(Buffer.concat(chunks).toString("utf8")) as { signedInnerXdr?: string };
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== "POST") {
    res.writeHead(405, { "content-type": "application/json" });
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  try {
    const feePayerSecret = process.env.FEE_PAYER_SECRET;
    if (!feePayerSecret) throw new Error("FEE_PAYER_SECRET is not configured");

    const { signedInnerXdr } = await readBody(req);
    if (!signedInnerXdr) throw new Error("signedInnerXdr is required");

    const feePayer = StellarSdk.Keypair.fromSecret(feePayerSecret);
    const inner = StellarSdk.TransactionBuilder.fromXDR(signedInnerXdr, networkPassphrase);
    if (!(inner instanceof StellarSdk.Transaction)) throw new Error("Expected a signed classic Stellar transaction");

    const feeBump = StellarSdk.TransactionBuilder.buildFeeBumpTransaction(
      feePayer,
      String(Number(StellarSdk.BASE_FEE) * 10),
      inner,
      networkPassphrase,
    );
    feeBump.sign(feePayer);

    const server = new StellarSdk.Horizon.Server(horizonUrl);
    const result = await server.submitTransaction(feeBump);
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ hash: result.hash }));
  } catch (error) {
    res.writeHead(400, { "content-type": "application/json" });
    res.end(JSON.stringify({ error: error instanceof Error ? error.message : "Claim failed" }));
  }
}
