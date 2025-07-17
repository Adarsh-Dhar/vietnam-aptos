import { AptosWallet } from "@aptos-labs/wallet-adapter-core";
import { Types } from "aptos";

export async function deployMemecoinContract({
  wallet,
  moduleAddress,
  name,
  symbol,
  decimals,
  iconUri,
  projectUri,
  maxSupply,
}: {
  wallet: AptosWallet;
  moduleAddress: string; // e.g. "0xYourDeployedAddress"
  name: string;
  symbol: string;
  decimals: number;
  iconUri: string;
  projectUri: string;
  maxSupply?: string; // u128 as string, or undefined for unlimited
}) {
  const payload: Types.EntryFunctionPayload = {
    type: "entry_function_payload",
    function: `${moduleAddress}::memecoin_factory::create_memecoin`,
    type_arguments: [],
    arguments: [
      Array.from(new TextEncoder().encode(name)),
      Array.from(new TextEncoder().encode(symbol)),
      decimals,
      Array.from(new TextEncoder().encode(iconUri)),
      Array.from(new TextEncoder().encode(projectUri)),
      maxSupply ? { vec: [maxSupply] } : { none: true },
    ],
  };

  const tx = await wallet.signAndSubmitTransaction(payload);
  return tx;
} 