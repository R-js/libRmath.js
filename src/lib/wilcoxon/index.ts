import { dwilcox } from './dwilcox';
import { pwilcox } from './pwilcox';
import { qwilcox } from './qwilcox';
import { rwilcox as _rwilc }  from './rwilcox';
//import { WilcoxonCache } from './WilcoxonCache';

import { IRNG } from '../rng';
import { MersenneTwister } from '../rng/mersenne-twister';


export function Wilcoxon(rng: IRNG = new MersenneTwister(0)){
    function rwilcox(nn: number, m: number, n: number){
        return _rwilc(nn, m, n, rng);
    }
    return {
        dwilcox,
        pwilcox,
        qwilcox,
        rwilcox
    };
}
