# Shielded Payment — ZK Privacy on Stellar

A **shielded payment (privacy pool)** on Stellar using zero-knowledge proofs. Deposit XLM/tokens into a pool, then withdraw to a fresh address with a ZK proof — breaking the on-chain link between sender and receiver.

Built for **Stellar Hacks: Real-World ZK**.

---

## How It Works

```
┌─────────────────────────────────────────────────────┐
│                     User                             │
│  1. Pick a random secret s                           │
│  2. Compute commitment = hash(s)                     │
│  3. Deposit tokens + commitment into pool             │
│  4. Generate ZK proof (Noir circuit):                 │
│     "I know s such that hash(s) is in the Merkle tree │
│      without revealing which leaf is mine"            │
│  5. Withdraw to new address using proof + nullifier   │
└─────────────────────────────────────────────────────┘
```

### Key concepts

| Term | Description |
|------|-------------|
| **Secret** | Random value only you know (kept private) |
| **Commitment** | `poseidon_hash(secret)` — stored on-chain |
| **Merkle tree** | Append-only tree of all commitments (on-chain) |
| **Nullifier** | `poseidon_hash(commitment, secret)` — prevents double-spending |
| **ZK Proof** | Noir circuit proving you know a secret without revealing which commitment is yours |

---

## Architecture

```
shielded-payment/
├── circuits/shielded_payment/     # Noir ZK circuit
│   ├── Nargo.toml
│   └── src/main.nr               # Merkle membership + nullifier proof
├── contracts/shielded-payment/   # Soroban smart contract
│   ├── Cargo.toml
│   └── src/
│       ├── lib.rs                 # Deposit / withdraw logic
│       └── merkle.rs              # SHA256 Merkle tree ops
├── frontend/                     # React + Vite
│   ├── src/
│   │   ├── App.tsx
│   │   ├── components/
│   │   │   ├── Deposit.tsx
│   │   │   └── Withdraw.tsx
│   │   ├── hooks/useContract.ts
│   │   └── utils/proof.ts        # Noir proof generation in browser
│   └── ...
└── scripts/                      # Deploy & test helpers
```

---

## Setup

### Prerequisites

| Tool | Install |
|------|---------|
| **Rust** | `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh` |
| **Noir** | `curl -L https://raw.githubusercontent.com/noir-lang/noirup/main/install | bash` then `noirup` |
| **Soroban CLI** | `cargo install soroban-cli` |
| **Node.js 20+** | [nodejs.org](https://nodejs.org) |

### 1. Compile the ZK circuit

```bash
cd circuits/shielded_payment
nargo compile
```

This generates `circuits/target/shielded_payment.json` — the circuit bytecode used by the frontend to generate proofs.

### 2. Build the Soroban contract

```bash
cd contracts/shielded-payment
cargo build --target wasm32-unknown-unknown --release
```

### 3. Deploy to Stellar testnet

```bash
# Set your deployer secret
export DEPLOYER_SECRET=S...

# Deploy
soroban contract deploy \
  --wasm contracts/shielded-payment/target/wasm32-unknown-unknown/release/shielded_payment.wasm \
  --network testnet \
  --source $DEPLOYER_SECRET

# Initialize with a token address
soroban contract invoke \
  --id <CONTRACT_ID> \
  --network testnet \
  --source $DEPLOYER_SECRET \
  -- \
  initialize \
  --token C...

# Approve the contract to spend your tokens
soroban contract invoke \
  --id <TOKEN_CONTRACT> \
  --network testnet \
  --source $DEPLOYER_SECRET \
  -- \
  approve \
  --from <YOUR_ADDRESS> \
  --spender <CONTRACT_ID> \
  --amount 10000000000 \
  --expiration_ledger 999999
```

### 4. Run the frontend

```bash
cd frontend
cp .env.example .env
# Edit .env with your deployed contract ID
npm install
npm run dev
```

---

## Demo Flow

1. **Open** `http://localhost:5173`
2. **Connect** your Freighter or Albedo wallet (Stellar testnet)
3. **Deposit** — enter an amount. The app generates a random secret, computes `commitment = hash(secret)`, and submits it to the Soroban contract along with your tokens.
4. **Generate Proof** — the ZK circuit runs in your browser (via `bb.js`). It produces a Groth16 proof that you know the secret for one of the commitments in the Merkle tree.
5. **Withdraw** — paste a recipient address. The app submits the proof, nullifier, and Merkle path to the contract. The contract verifies the Merkle proof, checks the nullifier is unused, and transfers the tokens.

---

## ZK Circuit Details

The Noir circuit (`circuits/shielded_payment/src/main.nr`) proves:

```
I know a secret s such that:
  - commitment = poseidon(s) is a leaf in the Merkle tree with root R
  - nullifier = poseidon(commitment, s) is correct
```

**Public inputs:** `merkle_root`, `nullifier`, `recipient`
**Private inputs:** `secret`, `merkle_path`, `path_index`

The Merkle tree is SHA256-based (on-chain) for gas efficiency. The circuit uses Poseidon hash (ZK-friendly) for the commitment/nullifier.

---

## Protocol 26 Benefits

Stellar Protocol 26 (Soroban) enables:
- **WASM smart contracts** — the verifier and pool logic runs in a lightweight WASM runtime
- **Cheaper storage** — commitments and nullifiers are stored efficiently
- **Host function crypto** — SHA256, Ed25519, and secp256k1 are available as native host functions (no WASM overhead)
- **Low transaction fees** — each deposit/withdraw costs pennies

---

## Submitting to the Hackathon

This project satisfies all requirements:

| Requirement | Status |
|-------------|--------|
| Open-source repo | ✅ MIT license |
| Demo video | Show the deposit → proof → withdraw flow |
| ZK doing real work | Noir circuit generates a privacy-preserving proof |
| Works on Stellar | Soroban contract deployed on testnet |

### Tips for the video

- Show the frontend running
- Generate a proof (the spinner + "proof generated" moment is impressive)
- Explain: "The ZK proof proves I own a commitment in the tree without showing which one"
- Show the nullifier being marked spent (double-spend rejection)

---

## License

MIT
