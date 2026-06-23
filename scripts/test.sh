#!/usr/bin/env bash
set -euo pipefail

echo "=== Testing Noir circuit ==="
cd circuits/shielded_payment
nargo test
cd ../..

echo "=== Testing Soroban contract ==="
cd contracts/shielded-payment
cargo test
cd ../..

echo "=== Running integration tests ==="
cargo test --test integration
