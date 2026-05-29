import * as StellarSdk from "@stellar/stellar-sdk";

export const stellarNetwork = import.meta.env.VITE_STELLAR_NETWORK === "mainnet" ? "mainnet" : "testnet";
export const networkPassphrase =
  stellarNetwork === "mainnet" ? StellarSdk.Networks.PUBLIC : StellarSdk.Networks.TESTNET;
export const horizonUrl =
  stellarNetwork === "mainnet" ? "https://horizon.stellar.org" : "https://horizon-testnet.stellar.org";
export const explorerBase =
  stellarNetwork === "mainnet" ? "https://stellar.expert/explorer/public" : "https://stellar.expert/explorer/testnet";

export const defaultUsdcIssuer =
  import.meta.env.VITE_USDC_ISSUER ?? "GBBD47IF4LWE5O4WZFK5EGQYTKM7UZ5D7YI67SP4BRKFS35ITC2ZALE5";

export function makeAsset(code = "USDC", issuer = defaultUsdcIssuer) {
  return new StellarSdk.Asset(code, issuer);
}

export function isValidPublicKey(value?: string) {
  return Boolean(value && StellarSdk.StrKey.isValidEd25519PublicKey(value));
}

export function makeMockBalanceId(seed: string) {
  return `demo-${seed.slice(0, 8)}-${crypto.randomUUID().slice(0, 8)}`;
}

export async function buildCreateClaimableBalanceXdr(input: {
  organizerPublicKey: string;
  recipientPublicKey: string;
  amount: string;
  token: string;
  issuer: string;
  deadline?: string;
}) {
  const server = new StellarSdk.Horizon.Server(horizonUrl);
  const source = await server.loadAccount(input.organizerPublicKey);
  const deadline = input.deadline ? Math.max(0, Math.floor((new Date(input.deadline).getTime() - Date.now()) / 1000)) : 0;
  const claimants = deadline
    ? [
        new StellarSdk.Claimant(input.recipientPublicKey, StellarSdk.Claimant.predicateBeforeRelativeTime(String(deadline))),
        new StellarSdk.Claimant(
          input.organizerPublicKey,
          StellarSdk.Claimant.predicateNot(StellarSdk.Claimant.predicateBeforeRelativeTime(String(deadline))),
        ),
      ]
    : [new StellarSdk.Claimant(input.recipientPublicKey, StellarSdk.Claimant.predicateUnconditional())];

  const tx = new StellarSdk.TransactionBuilder(source, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase,
  })
    .addOperation(
      StellarSdk.Operation.createClaimableBalance({
        asset: makeAsset(input.token, input.issuer),
        amount: input.amount,
        claimants,
      }),
    )
    .setTimeout(180)
    .build();

  return tx.toXDR();
}

export async function buildClaimBalanceXdr(input: {
  recipientPublicKey: string;
  balanceId: string;
}) {
  const server = new StellarSdk.Horizon.Server(horizonUrl);
  const source = await server.loadAccount(input.recipientPublicKey);
  const tx = new StellarSdk.TransactionBuilder(source, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase,
  })
    .addOperation(StellarSdk.Operation.claimClaimableBalance({ balanceId: input.balanceId }))
    .setTimeout(60)
    .build();

  return tx.toXDR();
}

export async function submitSignedTransaction(xdr: string) {
  const server = new StellarSdk.Horizon.Server(horizonUrl);
  const tx = new StellarSdk.Transaction(xdr, networkPassphrase);
  return server.submitTransaction(tx);
}
