import { useState } from "react";

interface Props {
  secret: bigint;
  onDeposited: (commitment: string) => void;
}

export default function Deposit({ secret, onDeposited }: Props) {
  const [amount, setAmount] = useState("10");
  const [sending, setSending] = useState(false);

  // In the browser, compute commitment = poseidon(secret)
  // For this demo, we use a simplified hash
  async function computeCommitment(s: bigint): Promise<string> {
    const enc = new TextEncoder();
    const data = enc.encode(s.toString(16));
    const hash = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  return (
    <section>
      <h2>Deposit</h2>

      <label>
        Amount (XLM):
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min="1"
          style={{ display: "block", margin: "8px 0", width: "100%" }}
        />
      </label>

      <button
        disabled={sending}
        onClick={async () => {
          setSending(true);
          try {
            const commitment = await computeCommitment(secret);
            // TODO: call Soroban contract deposit()
            // const tx = await contract.deposit(wallet, commitment, amount);
            // await tx.signAndSend();
            onDeposited(commitment);
          } finally {
            setSending(false);
          }
        }}
      >
        {sending ? "Depositing..." : "Deposit"}
      </button>

      <details style={{ marginTop: 16 }}>
        <summary>Your secret (keep private)</summary>
        <code style={{ fontSize: 12, wordBreak: "break-all" }}>
          {secret.toString(16)}
        </code>
      </details>
    </section>
  );
}
