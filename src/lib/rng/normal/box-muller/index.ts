

import type { IRNGNormalType } from '@lib/rng/normal/rng-types';
import { IRNG } from '@rng/irng';
import { IRNGNormal } from '@rng/normal/normal-rng';

const { log, sqrt, cos, sin } = Math;

const DBL_MIN = 2.22507e-308;
const M_PI = 3.14159265358979323846264338327950288;

export class BoxMuller extends IRNGNormal {
    public static override kind: IRNGNormalType = 'BOX_MULLER';

    private BM_norm_keep: number;

    public override reset(rng: IRNG): void {
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
