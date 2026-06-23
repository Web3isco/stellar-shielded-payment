import { useState, useEffect } from "react";
import Deposit from "./components/Deposit";
import Withdraw from "./components/Withdraw";
import { setupNoir, generateProof } from "./utils/proof";

type Step = "intro" | "deposit" | "proof" | "withdraw" | "done";

export default function App() {
  const [step, setStep] = useState<Step>("intro");
  const [secret, setSecret] = useState<bigint>(() => generateSecret());
  const [commitment, setCommitment] = useState<string>("");
  const [nullifier, setNullifier] = useState<string>("");
  const [noirReady, setNoirReady] = useState(false);

  useEffect(() => {
    setupNoir().then(() => setNoirReady(true));
  }, []);

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: 24 }}>
      <h1>Shielded Payment</h1>
      <p style={{ opacity: 0.6 }}>
        Private transactions on Stellar using zero-knowledge proofs
      </p>

      <hr style={{ margin: "24px 0" }} />

      {step === "intro" && (
        <section>
          <h2>How it works</h2>
          <ol>
            <li><strong>Deposit</strong> — Lock tokens with a private commitment</li>
            <li><strong>Generate ZK Proof</strong> — Prove you know the secret without revealing which deposit is yours</li>
            <li><strong>Withdraw</strong> — Use the proof to withdraw to a new address</li>
          </ol>
          <button onClick={() => setStep("deposit")} disabled={!noirReady}>
            {noirReady ? "Start" : "Loading Noir..."}
          </button>
        </section>
      )}

      {step === "deposit" && (
        <Deposit
          secret={secret}
          onDeposited={(commit) => {
            setCommitment(commit);
            setStep("proof");
          }}
        />
      )}

      {step === "proof" && (
        <section>
          <h2>Generate Zero-Knowledge Proof</h2>
          <p>Secret: <code>{secret.toString(16).slice(0, 16)}…</code></p>
          <p>Commitment: <code>{commitment.slice(0, 16)}…</code></p>
          <button
            onClick={async () => {
              const nf = await generateProof(secret, commitment);
              setNullifier(nf);
              setStep("withdraw");
            }}
          >
            Generate Proof &rarr;
          </button>
        </section>
      )}

      {step === "withdraw" && (
        <Withdraw
          nullifier={nullifier}
          secret={secret}
          onWithdrawn={() => setStep("done")}
        />
      )}

      {step === "done" && (
        <section>
          <h2>Done!</h2>
          <p>
            You've completed a shielded transaction on Stellar.
            The ZK proof ensured your privacy — nobody knows which deposit you withdrew from.
          </p>
          <button onClick={() => {
            setSecret(generateSecret());
            setCommitment("");
            setNullifier("");
            setStep("intro");
          }}>
            New Transaction
          </button>
        </section>
      )}
    </div>
  );
}

function generateSecret(): bigint {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return BigInt("0x" + Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join(""));
}
