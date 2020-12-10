/* This is a conversion from libRmath.js to Typescript/Javascript
Copyright (C) 2018  Jacob K.F. Bogers  info@mail.jacob-bogers.com

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

import { numberPrecision } from "../src/lib/r-func";

const { isNaN, isFinite } = Number;

function createFP32BitFieldComparor() {
    // determin endianess
    let dv = new DataView(new Float32Array(Infinity));
    let bigEndian = dv.getUint8(0) === 0x7f && dv.getUint8(1) === 0x80 && dv.getUint8(2) === 0 && dv.getUint8(3);
    // prepare
    const v1 = new Float32Array(1);
    const v2 = new Float32Array(2);
    const dv1 = new DataView(v1);
    const dv2 = new DataView(v2);

    return function check(a: number, b: number) {
        dv1.setFloat32(0, a, !bigEndian);
        dv2.setFloat32(0, b, !bigEndian);
        // sign
        let signIndex = bigEndian ? 0 : 3;
        const sign1 = dv1.getUint8(signIndex);
        const sign2 = dv2.getUint8(signIndex);
        console.log(sign1.toString(2));
        console.log(sign2.toString(2));

        

    }
}
/*
export function creatApproximator(prec) {
    return function approximitly(act: number, exp: number) {
        if (typeof act !== 'number') {
            throw new TypeError(`actual [${act}] is not a number`)
        }
        switch (true) {
            case isNaN(act):
                assert.isNaN(exp);
                break;
            case isFinite(act):
                assert.approximately(act, exp, prec, `numbers are NOT close within ${prec}`);
                break;
            case !isFinite(act): // Infinite?
                assert.equal(act, exp);
                break;
            default:
                throw 'Unknown number';
        }
    }
}
*/
export function createComment(inputObj: any): string {
    const proto = Object.keys(inputObj).reduce((builder, key) => {
        const v = inputObj[key]
        if (v === undefined) {
            builder.defaults = true
        }
        else {
            builder.descs.push(`${key}=${v}`)
        }
        return builder
    }, { descs: [] as string[], defaults: false });
    return `${proto.descs.join(',')}${(proto.defaults ? ' and defaults' : '')}`
}


