import { bessel_i } from './besselI';
import { bessel_j } from './besselJ';
import { bessel_k } from './besselK';
import { bessel_y } from './besselY';



export const special = Object.freeze({
    besselJ: bessel_j,
    besselY: bessel_y,
    besselK: bessel_k,
    besselI: bessel_i
});

