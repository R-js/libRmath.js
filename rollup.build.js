import { rollup } from 'rollup';
import { builtinModules } from 'module';

import { terser } from 'rollup-plugin-terser';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { resolve, } from 'path';

const builtin = builtinModules.slice()
builtin.splice(builtinModules.indexOf('crypto'), 1);


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
    const debugSource = `
      export function debug(ns) { return function(...args) { console.error(ns,...args) }; }
    `;
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
            if (source === 'debug') {
                return source;
            }
            return null;
        },
        async load(id) {
            if (id.includes('crypto')) {
                return cryptoStub;
            }
            if (id === 'debug') {
                return debugSource;
            }
            return null;
        },
    };
}
// see below for details on the options
const inputOptions = {
    input: {
        'lib-r-math': 'es6/index.js',
    },
    external: (id) => {
        return builtin.includes(id);
    },
   plugins: [shims(), commonjs(), nodeResolve()],
};

const outputOptions = {
    format: 'es',
    dir: 'browser',
    sourcemap: true,
    name: 'R',
    entryFileNames:'[name].js',
    globals: {
        [resolve('./es6/packages/common/logger')]: 'R.logger',
    },
    extend: true,
};


const outputOptionsMinimal = Object.assign({}, outputOptions, { compact: true, entryFileNames:'[name].min.js' ,plugins: [ terser() ] });

async function build() {
    const bundle = await rollup(inputOptions);
    await bundle.generate(outputOptions);
    await bundle.write(outputOptions);
    await bundle.write(outputOptionsMinimal);
}

build();