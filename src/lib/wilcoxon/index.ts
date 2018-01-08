import { dwilcox } from './dwilcox';
import { pwilcox } from './pwilcox';
import { qwilcox } from './qwilcox';
import { rwilcox as _rwilc }  from './rwilcox';
//import { WilcoxonCache } from './WilcoxonCache';

import { IRNG, rng as _rng } from '../rng';


export function Wilcoxon(rng: IRNG = new _rng.MersenneTwister(0)){
    function rwilcox(nn: number, m: number, n: number){
        return _rwilc(nn, m, n, rng);
    }
    return {
        dwilcox,
        pwilcox,
        qwilcox,
        rwilcox
     //   WilcoxonCache
    };
}
