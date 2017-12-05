
import { IRNG } from '../';

export abstract class IRNGNormal {

    protected rng: IRNG;
    constructor(_rng: IRNG){
        this.rng = _rng;
    }

    public abstract norm_rand(): number;
}
