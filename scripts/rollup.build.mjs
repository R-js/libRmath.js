import { rollup } from 'rollup';
import { builtinModules } from 'module';

import terser from '@rollup/plugin-terser';
import { nodeResolve } from '@rollup/plugin-node-resolve';

const builtin = builtinModules.slice()
builtin.splice(builtinModules.indexOf('crypto'), 1);

import pkg from "../package.json" assert { type: "json" };

const version = pkg.version;


function shims() {
    // for browser, mimic with WebApi the nodejs "crypto" https://nodejs.org/api/crypto.html#crypto_crypto_randombytes_size_callback
    const cryptoStub = `export function randomBytes(n) {
        return {
            readUInt32BE(offset = 0) {
                if (n - offset < 4) {
                    throw new RangeError('[ERR_BUFFER_OUT_OF_BOUNDS]: Attempt to write outside buffer bounds');
                }
                const sampler = new Uint8Array(n);
                globalThis.crypto.getRandomValues(sampler);
                const dv = new DataView(sampler.buffer);
                return dv.getUint32(offset, false);
            },
        };
    }`;
    return {
        name: 'stubbing for browser',
        async resolveId(source, importer) {
           // console.log(`${importer} <- ${source}`);
            if (!importer) {
                return null; // skip entry files
            }
            if (source.includes('crypto')) {
                return source;
            }
            return null;
        },
        async load(id) {
            if (id.includes('crypto')) {
                return cryptoStub;
            }
            return null;
        },
    };
}
// see below for details on the options
const inputOptions = {
    input: {
         'web': 'dist/esm/index.mjs',
    },
    external: (id) => {
        return builtin.includes(id);
    },
   plugins: [
    shims(),
    nodeResolve({ dedupe:[ "@mangos/debug", "ms" ],  exportConditions:["import"] })
],
};

const esmOutputOptions = {
    format: 'es',
    dir: 'dist',
    sourcemap: false,
    entryFileNames:`[name].esm.mjs`,
    extend: true,
    exports: 'named'
};


const esmOutputOptionsMinimal = Object.assign({}, esmOutputOptions, { 
    compact: true,
    entryFileNames:`[name].min.mjs` 
   ,plugins: [ terser() ]
 });

 const iifeOutputOptions = {
    format: 'iife',
    dir: 'dist',
    sourcemap: false,
    name: 'R',
    entryFileNames:`[name].iife.js`,
    exports: 'named',
    extend: true,
};

const iifeOutputOptionsMinimal = Object.assign({}, iifeOutputOptions, { 
    compact: true,
    entryFileNames:`[name]-iife.min.js`, 
    plugins: [ terser() ]
 });


async function build() {
    const bundle = await rollup(inputOptions);
    await bundle.generate(esmOutputOptions);
    await bundle.write(esmOutputOptions);
    await bundle.generate(iifeOutputOptions);
    await bundle.write(iifeOutputOptions);
}

build();