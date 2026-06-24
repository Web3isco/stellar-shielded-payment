// Shielded Payment Circuit — Privacy Pool on Stellar
//
// Proves: I know secret s such that commitment = pedersen(s)
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
    // Commitment = pedersen(secret)
    let commitment = std::hash::pedersen([secret])[0];

    // Nullifier = pedersen(commitment, secret)
    let comp_nullifier = std::hash::pedersen([commitment, secret])[0];
    assert(comp_nullifier == nullifier);

    // Verify Merkle proof
    let computed_root = compute_merkle_root(commitment, path_index, merkle_path);
    assert(computed_root == merkle_root);

    // Recipient must be non-zero
    assert(recipient != 0);
}

// Merkle proof verification using Pedersen hash
// Each level: hash(left, right) where left/right depends on path index
fn compute_merkle_root(leaf: Field, index: Field, path: [Field; 10]) -> Field {
    let mut current = leaf;
    let mut idx = index;

    for i in 0..10 {
        let sibling = path[i];
        if (idx & 1) == 0 {
            current = std::hash::pedersen([current, sibling])[0];
        } else {
            current = std::hash::pedersen([sibling, current])[0];
        }
        idx = idx >> 1;
    }

    current
}
