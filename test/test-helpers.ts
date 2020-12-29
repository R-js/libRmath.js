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

function mantissa64Bits(dv: DataView){
   return (dv.getUint8(2) & 0x0F).toString(2).padStart(4,'0') // 4 bits
    + dv.getUint8(3).toString(2).padStart(8,'0') // 8
    + dv.getUint8(4).toString(2).padStart(8,'0') // 8
    + dv.getUint8(5).toString(2).padStart(8,'0') // 8
    + dv.getUint8(6).toString(2).padStart(8,'0') // 8
    + dv.getUint8(7).toString(2).padStart(8,'0') // 8
    + dv.getUint8(8).toString(2).padStart(8,'0') // 8
}

function mantissa32Bits(dv: DataView){
    return (dv.getUint8(2) & 0x7F).toString(2).padStart(7, '0') // 7 bits
    + dv.getUint8(3).toString(2).padStart(8,'0') // 8
    + dv.getUint8(4).toString(2).padStart(8,'0') // 8
}

function exp64(dv: DataView){
   return (dv.getUint8(0) << 4) + (dv.getUint8(1) >> 4);
}

function exp32(dv: DataView){
    return (dv.getUint8(0) << 1) + (dv.getUint8(1) >> 7);
 }
 

function sign(dv: DataView){
   return !!(dv.getUint8(0) && 0b10000000);
}

enum BITRESULT {
    UNEQUALSIGN = 1,
    UNEQUALEXP
}

function check64Bit(a: number,b: number, dv1: DataView, dv2: DataView){
    dv1.setFloat64(0, a, false);
    dv2.setFloat64(0, b, false);
    // get sign of 64 bit float
    // how are you 
    const sign1 = sign(dv1);
    const sign2 = sign(dv2);
    if (sign1 !== sign2){
        return [BITRESULT.UNEQUALSIGN, sign1, sign2];
    }
    const exp1 = exp64(dv1);
    const exp2 = exp64(dv2);
    if (exp1 !== exp2){
        return [BITRESULT.UNEQUALEXP, exp1, exp2];
    }
    //52 bits -> 6 octets and 1 nibble, so mask the upper nibble bits with zeros aka 0x0F
    const man1 = mantissa64Bits(dv1);
    const man2 = mantissa64Bits(dv2);
    // check how far the mantissas are equal
    let i=0;
    // no equal 0
    // 1 equal 1
    // everything equal 52
    for (; i <= 51; i++){
        if (man1[i] !== man2[i]){
            break;
        }
    }
    return [undefined, i, man1, man2];
}

function check32Bit(a: number,b: number, dv1: DataView, dv2: DataView){
    dv1.setFloat32(0, a, false);
    dv2.setFloat32(0, b, false);
    // get sign of 64 bit float
    // how are you 
    const sign1 = sign(dv1);
    const sign2 = sign(dv2);
    if (sign1 !== sign2){
        return [ BITRESULT.UNEQUALSIGN, sign1, sign2];
    }
    const exp1 = exp32(dv1);
    const exp2 = exp32(dv2);
    if (exp1 !== exp2){
        return [ BITRESULT.UNEQUALEXP, exp1, exp2 ];
    }
    //52 bits -> 6 octets and 1 nibble, so mask the upper nibble bits with zeros aka 0x0F
    const man1 = mantissa32Bits(dv1);
    const man2 = mantissa32Bits(dv2);
    // check how far the mantissas are equal
    let i=0;
    // no equal 0
    // 1 equal 1
    // everything equal 52
    for (; i <= 23; i++){
        if (man1[i] !== man2[i]){
            break;
        }
    }
    return [undefined, i, man1, man2];
}

export function createFloatBitFieldComparator(use64BIT: boolean = false) {
    // prepare
    const v1 = use64BIT ? new Float64Array(1) : new Float32Array(1);
    const v2 = use64BIT ? new Float64Array(2) : new Float32Array(2);
    const dv1 = new DataView(v1);
    const dv2 = new DataView(v2);

    return function check(a: number, b: number) {
        if (use64BIT){
            return check64Bit(a,b, dv1, dv2);
        }
        return check32Bit(a,b, dv1, dv2);
    }
}

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


