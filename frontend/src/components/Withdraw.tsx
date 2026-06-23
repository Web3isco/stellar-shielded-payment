import { useState } from "react";

interface Props {
  nullifier: string;
  secret: bigint;
  onWithdrawn: () => void;
}

export default function Withdraw({ nullifier, secret, onWithdrawn }: Props) {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("10");
  const [sending, setSending] = useState(false);
  const [txHash, setTxHash] = useState("");

  return (
    <section>
      <h2>Withdraw</h2>

      <label>
        Recipient address:
        <input
          type="text"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          placeholder="G..."
          style={{ display: "block", margin: "8px 0", width: "100%" }}
        />
      </label>

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
        disabled={sending || !recipient}
        onClick={async () => {
          setSending(true);
          try {
            // TODO: call Soroban contract withdraw()
            // const tx = await contract.withdraw(
            //   nullifier, recipient, amount,
            //   merkleProof, pathIndex, commitment
            // );
            // const result = await tx.signAndSend();
            // setTxHash(result.hash);
            onWithdrawn();
          } finally {
            setSending(false);
          }
        }}
      >
        {sending ? "Withdrawing..." : "Withdraw"}
      </button>

      {txHash && (
        <p>
          Tx: <code>{txHash}</code>
        </p>
      )}

      <details style={{ marginTop: 16 }}>
        <summary>Nullifier (public)</summary>
        <code style={{ fontSize: 12, wordBreak: "break-all" }}>
          {nullifier}
        </code>
      </details>
    </section>
  );
}
