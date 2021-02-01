const rollup = require('rollup');
// builtinModules is frozen!!! (Object.freeze)
const builtin = require('module').builtinModules.slice();
const { terser } = require('rollup-plugin-terser');
//const { nodeResolve } = require('@rollup/plugin-node-resolve');
const { resolve, dirname } = require('path');

builtin.splice(builtin.indexOf('crypto'), 1);

function shims() {
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
      export default debug;
    `;
    return {
        name: 'stubbing for browser',
        async resolveId(source, importer) {
            console.log(`${importer} <- ${source}`);
            if (!importer) {
                return null; // skip entry files
            }
            if (source === 'crypto') {
                return source;
            }
            if (source === 'debug') {
                return source;
            }
            return null;
        },
        async load(id) {
            if (id === 'crypto') {
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
        'lib-r-math': 'es6/lib/rng/index.js',
    },
    external: (id, parentId, isResolved) => {
        /* if (/logger/.test(id)) {
            if (!isResolved) {
                return resolve('es6/packages/common/logger') === resolve(dirname(parentId), id);
            }
            return resolve('es6/packages/common/logger.js') === id;
        }*/
        if (builtin.includes(id)) {
            return true;
        }
        return false;
    },
    plugins: [shims()],
};

const outputOptions = {
    format: 'es',
    dir: 'browser',
    sourcemap: true,
    name: 'R',
    preserveModules: true,
    globals: {
        [resolve('./es6/packages/common/logger')]: 'R.logger',
    },
    extend: true,
};

async function build() {
    // exclude nodejs buildins except the ones we are going to shim

    //inputOptions.external = builtin;
    const bundle = await rollup.rollup(inputOptions);
    const { output } = await bundle.generate(outputOptions);
    console.log('OutputGenerated');
    let taocp1997init;
    for (const chunkOrAsset of output) {
        if (chunkOrAsset.type === 'asset') {
            // For assets, this contains
            // {
            //   fileName: string,              // the asset file name
            //   source: string | Uint8Array    // the asset source
            //   type: 'asset'                  // signifies that this is an asset
            // }
            //console.log('Asset', chunkOrAsset.fileName);
        } else {
            const { name, type, fileName, modules, code } = chunkOrAsset;
            if (name === 'taocp-1997-init') {
                console.log(code)
            }
            console.log(`${name}, ${type}, ${fileName}, ${JSON.stringify(modules)}`);
            // For chunks, this contains
            // {
            //   code: string,                  // the generated JS code
            //   dynamicImports: string[],      // external modules imported dynamically by the chunk
            //   exports: string[],             // exported variable names
            //   facadeModuleId: string | null, // the id of a module that this chunk corresponds to
            //   fileName: string,              // the chunk file name
            //   implicitlyLoadedBefore: string[]; // entries that should only be loaded after this chunk
            //   imports: string[],             // external modules imported statically by the chunk
            //   importedBindings: {[imported: string]: string[]} // imported bindings per dependency
            //   isDynamicEntry: boolean,       // is this chunk a dynamic entry point
            //   isEntry: boolean,              // is this chunk a static entry point
            //   isImplicitEntry: boolean,      // should this chunk only be loaded after other chunks
            //   map: string | null,            // sourcemaps if present
            //   modules: {                     // information about the modules in this chunk
            //     [id: string]: {
            //       renderedExports: string[]; // exported variable names that were included
            //       removedExports: string[];  // exported variable names that were removed
            //       renderedLength: number;    // the length of the remaining code in this module
            //       originalLength: number;    // the original length of the code in this module
            //     };
            //   },
            //   name: string                   // the name of this chunk as used in naming patterns
            //   referencedFiles: string[]      // files referenced via import.meta.ROLLUP_FILE_URL_<id>
            //   type: 'chunk',                 // signifies that this is a chunk
            // }
            //console.log('Chunk', chunkOrAsset.fileName);
        }
    }

    // or write the bundle to disk
    await bundle.write(outputOptions);
}

build();