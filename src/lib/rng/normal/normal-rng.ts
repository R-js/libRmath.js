'use strict';
/* This is a conversion from libRmath.so to Typescript/Javascript
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
import { IRNG, MessageType } from '@rng/irng';
import type { IRNGNormalType } from '@lib/rng/normal/rng-types';

//normal/in01-type';
import type { IRandom } from '@rng/IRandom';

export abstract class IRNGNormal implements IRandom {

    public static kind: IRNGNormalType;

    protected _rng!: IRNG;
    protected _name: string;

    // some normal rng's have internal state
    protected reset(rng?: IRNG, _seed?: number): void
    {     
        if (rng && rng.name !== this._rng.name){
            this._rng = rng;
        }
    }
    
    constructor(_rng: IRNG, name: string)
    {
        if (this.constructor.name === 'IRNGNormal'){
            throw new TypeError(`Cannot instantiate class "IRNGNormal" directly`);
        }
        this._name = name;
        this.register = this.register.bind(this);
        this.unregister = this.unregister.bind(this);
        this.register(_rng);
    }

    public unregister(): void {
        // unregister is "bound" so we can us init here
        // eslint-disable-next-line @typescript-eslint/unbound-method
        this._rng.unregister(MessageType.INIT, this.reset);
    }

    public register(_rng: IRNG): void {
        this._rng = _rng; // overwrite
        this.random = this.random.bind(this);
        this.randoms = this.randoms.bind(this);
        this.reset = this.reset.bind(this);
        // it IS bound, above line...
        // eslint-disable-next-line @typescript-eslint/unbound-method
        this._rng.register(MessageType.INIT, this.reset);
    }

    public randoms(n: number): Float32Array {
        n = !n || n < 0 ? 1 : n;
        const rc = new Float32Array(n);
        for (let i = 0; i < n; i++) {
            rc[i] = this.random();
        }
        return rc;
    }

    random(): number{
        throw new Error(`override this function in ${this.constructor.name}`)
    }

    public get name(): string {
        return this._name;
    }

    public get uniform_rng(): IRNG {
        return this._rng;
    }

}
