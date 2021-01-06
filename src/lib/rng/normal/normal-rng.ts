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
import { IRNG, MessageType } from '../irng';
import { IRNGNormalTypeEnum } from './in01-type';

export abstract class IRNGNormal {
    protected _rng: IRNG;
    protected _name: string;
    protected _kind: IRNGNormalTypeEnum;

    constructor(_rng: IRNG, name: string, kind: IRNGNormalTypeEnum) {
        this._rng = _rng;
        this._name = name;
        this._kind = kind;
        this.random = this.random.bind(this);
        this.randoms = this.randoms.bind(this);
        this.internal_norm_rand = this.internal_norm_rand.bind(this);
        this._rng.register(MessageType.INIT, this.reset.bind(this));
    }

    public randoms(n: number): Float32Array {
        n = !n || n < 0 ? 1 : n;
        const rc = new Float32Array(n);
        for (let i = 0; i < n; i++) {
            rc[i] = this.internal_norm_rand();
        }
        return rc;
    }

    public random() {
        return this.internal_norm_rand();
    }

    public get name() {
        return this._name;
    }

    public get kind() {
        return this._kind;
    }

    public get uniform_rng() {
        return this._rng;
    }

    // implementation specific
    protected abstract internal_norm_rand(): number;

    //reset
    protected abstract reset(_seed: number): void;
}
