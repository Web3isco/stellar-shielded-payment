import { BarretenbergBackend } from "@noir-lang/backend_barretenberg";
import { Noir } from "@noir-lang/noir_js";
import circuit from "../../../circuits/target/shielded_payment.json";

let noir: Noir | null = null;
let backend: BarretenbergBackend | null = null;

export async function setupNoir() {
  if (noir) return;
  backend = new BarretenbergBackend(circuit);
  noir = new Noir(circuit, backend);
}

export async function generateProof(
  secret: bigint,
  merkleRoot: string,
  nullifier: string,
  recipient: string,
  merklePath: string[],
  pathIndex: number
): Promise<{ proof: Uint8Array; publicInputs: string[] }> {
  if (!noir || !backend) throw new Error("Noir not initialized");

  const input = {
    secret: secret.toString(),
    merkle_root: merkleRoot,
    nullifier,
    recipient,
    merkle_path: merklePath,
    path_index: pathIndex.toString(),
  };

  const { proof, publicInputs } = await noir.generateFinalProof(input);
  return { proof, publicInputs };
}

export async function verifyProof(proof: Uint8Array, publicInputs: string[]): Promise<boolean> {
  if (!noir || !backend) throw new Error("Noir not initialized");
  return noir.verifyFinalProof({ proof, publicInputs });
}
