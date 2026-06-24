import {
  TransactionBuilder,
  Operation,
  Asset,
  Claimant,
  Networks,
  BASE_FEE,
  Keypair,
  StrKey,
  Transaction,
  FeeBumpTransaction,
  Horizon,
  rpc,
  xdr,
} from "@stellar/stellar-sdk";

export const RPC_URL = "https://soroban-testnet.stellar.org";
export const HORIZON_URL = "https://horizon-testnet.stellar.org";
export const NETWORK_PASSPHRASE = Networks.TESTNET;

// Circle's USDC on testnet
export const USDC_ISSUER = "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";
export const USDC_CODE = "USDC";
export const USDC_ASSET = new Asset(USDC_CODE, USDC_ISSUER);

export const horizonServer = new Horizon.Server(HORIZON_URL);

// --- Freighter Helpers ---

export function isFreighterInstalled(): boolean {
  return typeof window !== "undefined" && "freighter" in window && "freighterApi" in window;
}

export async function getFreighterAddress(): Promise<string> {
  const { getAddress } = await import("@stellar/freighter-api");
  const { address } = await getAddress();
  return address;
}

export async function signTxWithFreighter(txXdr: string): Promise<string> {
  const { signTransaction } = await import("@stellar/freighter-api");
  const { signedTxXdr } = await signTransaction(txXdr, {
    networkPassphrase: NETWORK_PASSPHRASE,
  });
  return signedTxXdr;
}

export async function isFreighterAllowed(): Promise<boolean> {
  const { isAllowed } = await import("@stellar/freighter-api");
  const result = await isAllowed();
  return result.isAllowed;
}

// --- Stellar Account Helpers ---

export async function accountExists(address: string): Promise<boolean> {
  try {
    await horizonServer.loadAccount(address);
    return true;
  } catch {
    return false;
  }
}

export async function hasTrustline(address: string): Promise<boolean> {
  try {
    const account = await horizonServer.loadAccount(address);
    return account.balances.some(
      (b: any) =>
        b.asset_type === "credit_alphanumeric4" &&
        b.asset_code === USDC_CODE &&
        b.asset_issuer === USDC_ISSUER
    );
  } catch {
    return false;
  }
}

export function isValidStellarAddress(addr: string): boolean {
  return StrKey.isValidEd25519PublicKey(addr);
}

export function isValidStellarStrKey(addr: string): boolean {
  return StrKey.isValidMed25519PublicKey(addr) || StrKey.isValidEd25519PublicKey(addr);
}

// --- Transaction Building ---

export interface RecipientInput {
  wallet: string;
  amount: string;
  deadline: number; // unix seconds
}

export async function buildCreateBalancesTx(
  source: string,
  recipients: RecipientInput[]
): Promise<Transaction> {
  const sourceAccount = await horizonServer.loadAccount(source);
  const txBuilder = new TransactionBuilder(sourceAccount, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  });

  for (const r of recipients) {
    txBuilder.addOperation(
      Operation.createClaimableBalance({
        asset: USDC_ASSET,
        amount: r.amount,
        claimants: [
          new Claimant(
            r.wallet,
            Claimant.predicateBeforeAbsoluteTime(r.deadline.toString())
          ),
        ],
      })
    );
  }

  return txBuilder.setTimeout(30).build();
}

export async function buildClaimBalanceTx(
  source: string,
  balanceId: string
): Promise<Transaction> {
  const sourceAccount = await horizonServer.loadAccount(source);
  const txBuilder = new TransactionBuilder(sourceAccount, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  });

  txBuilder.addOperation(
    Operation.claimClaimableBalance({
      balanceId,
    })
  );

  return txBuilder.setTimeout(30).build();
}

// --- Fee Bump (Server-side) ---

export function buildFeeBumpTransaction(
  innerTxXdr: string,
  feePayerSecret: string
): FeeBumpTransaction {
  const feePayerKp = Keypair.fromSecret(feePayerSecret);
  const innerTx = new Transaction(innerTxXdr, NETWORK_PASSPHRASE);
  const feeBump = TransactionBuilder.buildFeeBumpTransaction(
    feePayerKp,
    BASE_FEE,
    innerTx,
    NETWORK_PASSPHRASE
  );
  feeBump.sign(feePayerKp);
  return feeBump;
}

export async function getBalanceIdFromEffects(txHash: string): Promise<string[]> {
  const tx = await horizonServer.transactions().transaction(txHash).call();
  const effects = await horizonServer.effects().forTransaction(txHash).call();
  return effects.records
    .filter((e: any) => e.type === "claimable_balance_created")
    .map((e: any) => e.balance_id);
}
