// Integration test: simulates a full deposit → proof → withdraw flow
// using the Soroban contract test framework.

#[cfg(test)]
mod tests {
    use soroban_sdk::{testutils::AddressGenerator, Address, BytesN, Env, Vec};
    use shielded_payment::ShieldedPaymentContractClient;

    #[test]
    fn test_full_flow() {
        let env = Env::default();
        env.mock_all_auths();

        let token = AddressGenerator::generate(&env);
        let user1 = AddressGenerator::generate(&env);
        let user2 = AddressGenerator::generate(&env);

        let contract_id = env.register_contract(None, shielded_payment::ShieldedPayment);
        let client = ShieldedPaymentContractClient::new(&env, &contract_id);

        client.initialize(&token);

        // Deposit
        let commitment = BytesN::from_array(&env, &[1u8; 32]);
        client.deposit(&user1, &commitment, &1000i128);

        assert_eq!(client.get_commitment_count(), 1);

        // Withdraw (simplified — in production, provide real Merkle proof)
        let nullifier = BytesN::from_array(&env, &[2u8; 32]);
        let merkle_proof: Vec<BytesN<32>> = Vec::new(&env);
        let path_index = BytesN::from_array(&env, &[0u8, 0, 0, 0]);
        let commitment2 = BytesN::from_array(&env, &[1u8; 32]);

        client.withdraw(
            &nullifier,
            &user2,
            &1000i128,
            &merkle_proof,
            &path_index,
            &commitment2,
        );

        assert!(client.is_nullifier_spent(&nullifier));
    }
}
