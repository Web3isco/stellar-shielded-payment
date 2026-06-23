use soroban_sdk::{Bytes, BytesN, Env, Vec};

/// Compute the Merkle root of a list of leaves using SHA256
pub fn compute_root(env: &Env, leaves: &Vec<BytesN<32>>) -> BytesN<32> {
    if leaves.is_empty() {
        return BytesN::from_array(env, &[0u8; 32]);
    }

    let mut level: Vec<BytesN<32>> = Vec::new(env);
    for i in (0..leaves.len()).step_by(2) {
        let left = leaves.get(i).unwrap();
        if i + 1 < leaves.len() {
            let right = leaves.get(i + 1).unwrap();
            level.push_back(hash(env, &left, &right));
        } else {
            level.push_back(hash(env, &left, &left));
        }
    }

    while level.len() > 1 {
        let mut next: Vec<BytesN<32>> = Vec::new(env);
        for i in (0..level.len()).step_by(2) {
            let left = level.get(i).unwrap();
            if i + 1 < level.len() {
                let right = level.get(i + 1).unwrap();
                next.push_back(hash(env, &left, &right));
            } else {
                next.push_back(hash(env, &left, &left));
            }
        }
        level = next;
    }

    level.get(0).unwrap()
}

/// Verify a Merkle proof
pub fn verify(
    env: &Env,
    leaf: &BytesN<32>,
    path_index_bytes: &BytesN<4>,
    proof: &Vec<BytesN<32>>,
    root: &BytesN<32>,
) -> bool {
    let mut current = leaf.clone();
    let arr = path_index_bytes.to_array();
    let mut idx = u32::from_be_bytes(arr);

    for sibling in proof.iter() {
        if idx % 2 == 0 {
            current = hash(env, &current, &sibling);
        } else {
            current = hash(env, &sibling, &current);
        }
        idx /= 2;
    }

    &current == root
}

fn hash(env: &Env, left: &BytesN<32>, right: &BytesN<32>) -> BytesN<32> {
    let mut buf = [0u8; 64];
    buf[..32].copy_from_slice(&left.to_array());
    buf[32..].copy_from_slice(&right.to_array());
    let input = Bytes::from_array(env, &buf);
    env.crypto().sha256(&input)
}
