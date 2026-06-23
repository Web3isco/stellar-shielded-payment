#!/usr/bin/env bash
set -euo pipefail

echo "=== Building Noir circuit ==="
cd circuits/shielded_payment
nargo compile
cd ../..

echo "=== Building Soroban contract ==="
cd contracts/shielded-payment
cargo build --target wasm32-unknown-unknown --release
cd ../..

echo "=== Deploying contract to testnet ==="
soroban contract deploy \
  --wasm contracts/target/wasm32-unknown-unknown/release/shielded_payment.wasm \
  --network testnet \
  --source <DEPLOYER_SECRET>

echo "=== Initializing contract ==="
soroban contract invoke \
  --id <CONTRACT_ID> \
  --network testnet \
  --source <DEPLOYER_SECRET> \
  -- \
  initialize \
  --token <USDC_CONTRACT_ID>

echo "Done!"
