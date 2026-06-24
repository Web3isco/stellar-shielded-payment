// Shielded Payment — ZK Privacy Pool on Stellar
//
// Proves: I know secret s such that commitment = pedersen_hash(s)
//         is a leaf in the Merkle tree, without revealing which leaf.
//
// Public:  merkle_root, nullifier, recipient
// Private: secret, merkle_path[10], path_index

fn main(
    secret: Field,
    merkle_root: pub Field,
    nullifier: pub Field,
    recipient: pub Field,
    merkle_path: [Field; 10],
    path_index: Field,
) {
    let commitment = std::hash::pedersen_hash([secret]);
    let computed_nullifier = std::hash::pedersen_hash([commitment, secret]);
    assert(computed_nullifier == nullifier);

    let computed_root = compute_merkle_root(commitment, path_index, merkle_path);
    assert(computed_root == merkle_root);

    assert(recipient != 0);
}

fn compute_merkle_root(leaf: Field, index: Field, path: [Field; 10]) -> Field {
    let mut current = leaf;
    let mut idx = index;

    for i in 0..10 {
        let sibling = path[i];
        if (idx & 1) == 0 {
            current = std::hash::pedersen_hash([current, sibling]);
        } else {
            current = std::hash::pedersen_hash([sibling, current]);
        }
        idx = idx >> 1;
    }

    current
}
