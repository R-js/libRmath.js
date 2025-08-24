import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// Current file path
const __filename = fileURLToPath(import.meta.url);

// Current directory path
const __dirname = dirname(__filename);

// buffer
const raw = fs.readFileSync(join(__dirname, 'test.wasm'));

// type calc = (sum: number, term: number, p: number, xr: number, xend: number, xb: number, NB: number, NR: number ) => number;

console.log(raw.toString('base64'));
