import { compile, createFileManager } from '@noir-lang/noir_wasm';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  const fm = createFileManager('/');

  const nargoToml = readFileSync(join(__dirname, 'circuits', 'shielded_payment', 'Nargo.toml'), 'utf-8');
  const mainNr = readFileSync(join(__dirname, 'circuits', 'shielded_payment', 'src', 'main.nr'), 'utf-8');

  fm.writeFile('./Nargo.toml', nargoToml);
  fm.writeFile('./src/main.nr', mainNr);

  try {
    const result = await compile(fm);
    console.log('SUCCESS');
    console.log(JSON.stringify(result, null, 2).slice(0, 1000));
  } catch (e) {
    console.log('FAILED');
    console.log(e.message || e);
    if (e instanceof AggregateError) {
      for (const err of e.errors) {
        console.log('  -', err.message || err);
      }
    }
  }
}

main();
