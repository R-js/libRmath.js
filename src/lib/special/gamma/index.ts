
export { gammafn as gamma } from './gamma_fn';
export { digamma, pentagamma, psigamma, tetragamma, trigamma } from './polygamma';
export { lgammafn_sign, lgammafn_sign as lgamma  } from './lgammafn_sign';
 
// function gamma(x: number): number
// function lgamma(x: number, sgn?: Int32Array): number

/*The function lgammafn computes log|gamma(x)|.  The function
 *    lgammafn in addition assigns the sign of the gamma function
 *    to the address in the second argument if this is not null or undefined.
 */
// function psigamma(x, deriv = 0)




