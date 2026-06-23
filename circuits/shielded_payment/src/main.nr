// Shielded Payment Circuit
// Proves: I know a secret whose commitment is in the Merkle tree,
//         without revealing which leaf is mine
//
// Public inputs:  merkle_root, nullifier, recipient
// Private inputs: secret, merkle_path, path_index

fn main(
    secret: Field,
    merkle_root: pub Field,
    nullifier: pub Field,
    recipient: pub Field,
    merkle_path: [Field; 10],
    path_index: Field,
) {
    // Compute commitment = poseidon(secret)
    let commitment = std::hash::poseidon([secret]);

    // Compute nullifier = poseidon(commitment, secret)
    // This prevents double-spending: each note can only be spent once
    let computed_nullifier = std::hash::poseidon([commitment, secret]);
    assert(computed_nullifier == nullifier);

    // Verify Merkle proof: the commitment is in the tree
    let computed_root = std::merkle::compute_merkle_root(commitment, path_index, merkle_path);
    assert(computed_root == merkle_root);

    // Constrain recipient (ensures the withdrawal goes to the intended address)
    // recipient is a Field representation of the Stellar address
    assert(recipient != 0);
}
