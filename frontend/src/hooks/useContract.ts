import { useEffect, useState } from "react";
import {
  Contract,
  SorobanRpc,
  TransactionBuilder,
  Networks,
  nativeToScVal,
} from "@stellar/stellar-sdk";

const RPC_URL = "https://soroban-testnet.stellar.org";
const CONTRACT_ID = import.meta.env.VITE_CONTRACT_ID || "";

export function useContract() {
  const [server, setServer] = useState<SorobanRpc.Server | null>(null);

  useEffect(() => {
    setServer(new SorobanRpc.Server(RPC_URL));
  }, []);

  async function deposit(
    source: string,
    commitment: string,
    amount: string
  ) {
    if (!server) throw new Error("Not connected");

    const contract = new Contract(CONTRACT_ID);
    const sourceAccount = await server.getAccount(source);

    const tx = new TransactionBuilder(sourceAccount, {
      fee: "100",
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        contract.call(
          "deposit",
          nativeToScVal(source, { type: "address" }),
          nativeToScVal(commitment, { type: "bytes" }),
          nativeToScVal(amount, { type: "i128" })
        )
      )
      .setTimeout(30)
      .build();

    return tx;
  }

  async function withdraw(
    source: string,
    nullifier: string,
    recipient: string,
    amount: string,
    merkleProof: string[],
    pathIndex: number,
    commitment: string
  ) {
    if (!server) throw new Error("Not connected");

    const contract = new Contract(CONTRACT_ID);
    const sourceAccount = await server.getAccount(source);

    const tx = new TransactionBuilder(sourceAccount, {
      fee: "100",
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        contract.call(
          "withdraw",
          nativeToScVal(nullifier, { type: "bytes" }),
          nativeToScVal(recipient, { type: "address" }),
          nativeToScVal(amount, { type: "i128" }),
          nativeToScVal(merkleProof, { type: "vec" }),
          nativeToScVal(pathIndex, { type: "u32" }),
          nativeToScVal(commitment, { type: "bytes" })
        )
      )
      .setTimeout(30)
      .build();

    return tx;
  }

  return { server, deposit, withdraw };
}
