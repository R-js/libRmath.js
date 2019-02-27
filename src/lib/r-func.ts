const { abs, sign, floor, trunc, max } = Math;
const { isNaN } = Number;
const { isArray } = Array;

import * as debug from 'debug';

const printer_seq = debug('seq');
const precision9 = numberPrecision(9);

export function isOdd(n: number): boolean {
	if (isFinite(n)) {
		return floor(n / 2) * 2 < n;
	}
	throw new Error(`Not a finite Number: ${n}`);
}

export const seq = (adjust = 0) => (adjustMin = adjust) => (
	start: number,
	end?: number,
	step: number = 1
): number[] => {
	if (end === undefined) {
		if (start <= 0 || start === undefined) {
			return [];
		}
		end = 1;
	}
	let s = start + adjust;
	let e = end + adjust;
	let cursor = s;

	if (end < start) {
		e = start + adjustMin;
		s = end + adjustMin;
		cursor = e;
	}
	// wow: Chrome and FireFox give
	// 0.4+0.2 = 0.6000000000000001
	// so we use precision to have it make sense
	// sometimes rounding effects try something diff
	step = abs(step) * sign(end - start);
	printer_seq('step:%d', step);

	const rc: number[] = [];

	do {
		rc.push(cursor);
		cursor += step;
	} while (precision9(cursor) >= s && precision9(cursor) <= e && step !== 0);

	return precision9(rc) as any;
};

export function selector(...rest: (number | number[])[]): { (val: any, index: number): boolean } {
	const flat = flatten(rest);
	return (val: any, idx: number) => {
		return flat.indexOf(idx) >= 0;
	};
}

export function flatten<T>(...rest: (T | T[])[]): T[] {
	let rc: number[] = [];
	for (const itm of rest) {
		if (isArray(itm)) {
			let rc2: number[] = flatten(...itm) as any;
			rc.push(...rc2);
			continue;
		}
		rc.push(itm as any);
	}
	return rc as any;
}

export function arrayrify<T, R>(fn: (x: T, ...rest: any[]) => R) {
	return function(x: T | T[], ...rest: any[]): R | R[] {
		const fp = Array.isArray(x) ? x : [ x ];
		const result = fp.map((p) => fn(p, ...rest));
		return result.length === 1 ? result[0] : result;
	};
}

export function multiplex(fn: (...rest: (any | any[])[]) => any) {
	return function(...rest: (any | any[])[]) {
		return multiplexer(...rest)(fn);
	};
}

export function asArray(fn: (...rest: (any | any[])[]) => any) {
	return function(...rest: (any | any[])[]) {
		const ans = fn(...rest);
		return Array.isArray(ans) ? ans : [ ans ];
	};
}

function possibleScalar<T>(x: T[]): T | T[] {
	return x.length === 1 ? x[0] : x;
}

export { possibleScalar };

function coerceToArray(o: any): { key: string | number; val: any }[] {
	if (o === null || o === undefined) {
		throw new TypeError('Illegal argument excepton: input needs to NOT be "null" or "undefined".');
	}
	if (typeof o === 'number') {
		return [ { key: 0, val: o } ] as any;
	}
	if (isArray(o)) {
		return o.map((x, idx) => ({ key: idx, val: x } as any));
	}
	if (typeof o === 'string') {
		return o.split('').map((x, idx) => ({ key: idx, val: x } as any));
	}
	if (typeof o === 'object') {
		const names = Object.getOwnPropertyNames(o);
		if (names.length === 0) {
			throw new Error('Input argument is an Object with no properties');
		}
		return names.map((name) => ({ key: name, val: o[name] })) as any;
	}
	throw new Error('unreachable code');
}

export function multiplexer(...rest: (any | any[])[]) {
	//analyze
	const analyzed: any[] = [];

	for (let k = 0; k < rest.length; k++) {
		const arg = rest[k];
		// null is special
		if (arg === null) {
			analyzed.push([ arg ]);
			continue;
		}
		if ([ 'undefined', 'boolean', 'number' ].indexOf(typeof arg) >= 0) {
			analyzed.push([ arg ]);
			continue;
		}
		if (typeof arg === 'string') {
			analyzed.push(arg.split(''));
			continue;
		}
		if (Array.isArray(arg)) {
			analyzed.push(arg);
			continue;
		}
		if (arg instanceof Object) {
			throw new Error('Sorry, looping over properties not yet supported');
		}
		if (arg instanceof Function) {
			throw new Error('Sorry function arguments are not yet supported');
		}
	} //for
	// find the longest array
	const _max = max(...analyzed.map((a) => a.length));

	return function(fn: (...rest: any[]) => any): any | any[] {
		const rc: any[] = [];

		for (let k = 0; k < _max; k++) {
			const result: any[] = [];
			for (let j = 0; j < analyzed.length; j++) {
				const arr: any[] = analyzed[j];
				const idx = k % arr.length;
				result.push(arr[idx]);
			}
			rc.push(fn(...result));
		}
		return possibleScalar(rc);
	};
}

/**
 * 
 *  xx can be an array or a "pojo"-object with properties
 * 
 */

type ArrayElt = { key: string | number; val: any };

function iter<T>(wantMap = true) {
	return function(xx: T): { (fn: (x: any, idx?: number | string) => any): any | any[] } {
		const fx: ArrayElt[] = coerceToArray(xx) as any;
		return function(fn: (x: any, idx?: number | string) => any): any | any[] {
			return wantMap ? possibleScalar(fx.map((o) => fn(o.val, o.key))) : fx.forEach((o) => fn(o.val, o.key));
		};
	};
}

export const map = iter();
export const each = iter(false);

export function numberPrecision(prec: number = 6) {
	function convert(x: number): number {
		if (isNaN(x)) {
			return NaN;
		}
		return Number.parseFloat(x.toPrecision(prec));
	}

	return arrayrify(convert);
}

export function any<T>(x: T[]) {
	return function(fn: any | ((v: T, i?: number) => boolean)): boolean {
		if (fn instanceof Function) {
			return x.find(fn) !== undefined;
		}
		return x.find((d) => d === fn) !== undefined;
	};
}

export function sum(x: any[]): number {
	let rc = 0;
	for (let i = 0; i < x.length; i++) {
		if (isArray(x[i])) {
			rc += sum(x[i]);
			continue;
		}
		if (typeof x[i] === 'string') {
			const trial = Number.parseFloat(x[i]);
			if (Number.isFinite(trial)) {
				rc += trial;
				continue;
			}
			throw Error(`${x[i]} is not a number or can be coerced to a number`);
		}
		if (typeof x[i] === 'number' && Number.isFinite(x[i])) {
			rc += x[i];
			continue;
		}
		throw new Error(`${x[i]} is not a number`);
	}
	return rc;
}

export const div = multiplex((a: number, b) => a / b);
export const mult = multiplex((a: number, b) => a * b);

export interface ISummary {
	N: number; // number of samples in "data"
	mu: number; // mean of "data"
	population: {
		variance: number; // population variance (data is seen as finite population)
		sd: number; // square root of the population variance
	};
	sample: {
		variance: number; // sample variance (data is seen as a small sample from an very large population)
		sd: number; // square root of "sample variance"
	};
	relX; // = x-E(x)
	relX2; // = ( x-E(x) )^2
	stats: {
		min: number; // minimal value from "data"
		'1st Qu.': number; // 1st quantile from "data"
		median: number; // median value from "data
		'3rd Qu.': number; // 3rd quantile from "data"
		max: number; // maximum value in data
	};
}

export function summary(x: number[]): ISummary {
	if (!Array.isArray(x)) {
		throw new Error(`Illigal argument, not an array`);
	}
	if (x.length === 0) {
		throw new Error(`argument Array is empty`);
	}
	if (x.findIndex((v) => isNaN(v)) >= 0) {
		throw new Error(`argument Array has NaNs`);
	}

	const N = x.length;
  const mu = sum(x) / N;
  let relX2 = 0;
  for (let i = 0; i < x.length; i++) {
			relX2 +=  (x[i] - mu)*( x[i] - mu);
  }
  const sampleVariance = relX2 / (N - 1);
	const populationVariance = sampleVariance * (N - 1) / N;
	const sampleSD = Math.sqrt(sampleVariance);
	const populationSD = Math.sqrt(populationVariance);
	// quantiles
	const o = x.sort((a, b) => a - b);
	const min = o[0];
	const max = o[N - 1];
	//isOdd?
	const { q1, median, q3 } = (function() {
		const i = [ 4, 2, 4 / 3 ].map((v) => (N - 1) / v);
		const q = i.map((index) => {
			const f1 = 1 - (index - floor(index));
			const f2 = 1 - f1;
			return o[trunc(index)] * f1 + o[trunc(index) + 1] * f2;
		});
		return {
			q1: q[0],
			median: q[1],
			q3: q[2]
		};
	})();
	return {
		N,
		mu,
		population: {
			variance: populationVariance,
			sd: populationSD
		},
		sample: {
			variance: sampleVariance,
			sd: sampleSD
    },
    // only show first 50 of relX and relX2
	  relX: 'depricated',
		relX2: 'depricated',
		stats: {
			min,
			'1st Qu.': q1,
			median,
			'3rd Qu.': q3,
			max
		}
	};
}

// https://en.wikipedia.org/wiki/Welch%E2%80%93Satterthwaite_equation

export function Welch_Satterthwaite(s: number[], n: number[]): number {
	const elts = flatten(
		map(s)((_s, i) => {
			return _s * _s / n[i as number];
		})
	);
	const dom = elts.map((e, i) => e * e / (n[i as number] - 1));

	return Math.pow(sum(elts), 2) / sum(dom);
}
