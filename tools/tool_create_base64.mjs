const fs = require('fs');
const path = require('path');

// buffer
const raw = fs.readFileSync(path.join(__dirname, 'qhyper.acc.wasm'));

// type calc = (sum: number, term: number, p: number, xr: number, xend: number, xb: number, NB: number, NR: number ) => number;

console.log(raw.toString('base64'));


