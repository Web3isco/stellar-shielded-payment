.PHONY: all circuit contract frontend deploy test clean

all: circuit contract frontend

# Compile Noir ZK circuit
circuit:
	cd circuits/shielded_payment && nargo compile

# Build Soroban contract
contract:
	cd contracts/shielded-payment && cargo build --target wasm32-unknown-unknown --release

# Install frontend deps
frontend:
	cd frontend && npm install

# Deploy to testnet
deploy:
	./scripts/deploy.sh

# Run all tests
test: circuit
	cd circuits/shielded_payment && nargo test
	cd contracts/shielded-payment && cargo test
	cd frontend && npm run build

# Clean build artifacts
clean:
	cd circuits/shielded_payment && nargo clean || true
	cd contracts && cargo clean || true
	rm -rf frontend/dist frontend/node_modules
