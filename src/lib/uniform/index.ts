'use strict';
import { rng } from '../rng';
import { runif } from './runif';
import { dunif } from './dunif';
import { punif } from './punif';
import { qunif } from './qunif';

export function uniform( _rng = rng.MersenneTwister ){
   
 return {
     dunif: runif
 };   
}
