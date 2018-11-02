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

import { assert } from 'chai';
const { isNaN, isFinite } = Number;

export function creatApproximator(prec){
    return function approximitly(act: number, exp: number) {
        if (typeof act !== 'number'){
            return
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
    return `${proto.descs.join(',')}${(proto.defaults ? ' and defaults':'')}`
}

export const checkPrec9 = creatApproximator(1E-9);
export const checkPrec6 = creatApproximator(1E-6);
export const checkPrec3 = creatApproximator(1E-3);

