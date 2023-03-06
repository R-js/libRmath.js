'use strict'

// needed by rpois

import { abs} from '@lib/r-func';

export function fsign(x: number, signal: boolean) : number{
    if (isNaN(x)) return x;
    return signal ? abs(x) : -abs(x); 
}


