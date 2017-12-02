//export * from './bessel';
//export * from './beta';
//export * from './binomial';
import * as Cauchy from './cauchy';
import * as Chebyshev from './chebyshev';
import * as Chi2 from './chi-2';
import * as Common from './common';
import * as Devicance from './deviance';
import * as Exp from './exp';
import * as F from './f-distro';
import * as Gamma from './gamma';
import * as Geometric from './geometric';
import * as Log from './log';
import { rng as _rng } from './rng';
import * as rfunc from './r-func';

//https://github.com/Microsoft/TypeScript/pull/19852
//Fix declaration emit for imported export alias specifiers

// tslint:disable-next-line
export const rng = _rng;
/*
export * from './bessel';
export * from './beta';
export * from './binomial';
export * from './cauchy';
export * from './chebyshev';
export * from './chi-2';
export * from './common';
export * from './deviance';
export * from './exp';
export * from './f-distro';
export * from './gamma';
export * from './geometric';
export * from './log';
export * from './rng';
export * from './r-func';

*/
