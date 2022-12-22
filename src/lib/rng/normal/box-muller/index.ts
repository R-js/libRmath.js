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
import type { IRNGNormalType } from '@lib/rng/normal/rng-types';
import { IRNG } from '@rng/irng';
import { IRNGNormal } from '@rng/normal/normal-rng';

const { log, sqrt, cos, sin } = Math;

const DBL_MIN = 2.22507e-308;
const M_PI = 3.14159265358979323846264338327950288;

export class BoxMuller extends IRNGNormal {

    public static override kind: IRNGNormalType = "BOX_MULLER";

    private BM_norm_keep: number;

    public override reset(rng :IRNG):void {
        super.reset(rng);
        this.BM_norm_keep = 0;
    }

    constructor(_rng: IRNG) {
        super(_rng, 'Box-Muller');
        this.BM_norm_keep = 0; // not needed but tsc will give problems
    }

    public override random(): number {
        let s = 0.0;
        let theta = 0;

        if (this.BM_norm_keep !== 0.0) {
            /* An exact test is intentional */
            s = this.BM_norm_keep;
            this.BM_norm_keep = 0.0;
            return s;
        } else {
            theta = 2 * M_PI * this._rng.random();
            const R = sqrt(-2 * log(this._rng.random())) + 10 * DBL_MIN; /* ensure non-zero */
            this.BM_norm_keep = R * sin(theta);
            return R * cos(theta);
        }
    }
}
