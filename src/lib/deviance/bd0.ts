/*
 *  AUTHOR
 *  Jacob Bogers, jkfbogers@gmail.com
 *  Januari 22, 2017
 * 
 *  ORIGINAL C-CODE AUTHOR (R Project)
 *	Catherine Loader, catherine@research.bell-labs.com.
 *	October 23, 2000.
 *
 *  Merge in to R:
 *	Copyright (C) 2000-2014 The R Core Team
 *
 *  This program is free software; you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation; either version 2 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program; if not, a copy is available at
 * 
 *  License for JS language implementation
 *  https://www.jacob-bogers/libRmath.js/Licenses/
 * 
 *  License for R statistical package
 *  https://www.r-project.org/Licenses/
 * 
 *  
 *  DESCRIPTION
 *	Evaluates the "deviance part"
 *	bd0(x,M) :=  M * D0(x/M) = M*[ x/M * log(x/M) + 1 - (x/M) ] =
 *		  =  x * log(x/M) + M - x
 *	where M = E[X] = n*p (or = lambda), for	  x, M > 0
 *
 *	in a manner that should be stable (with small relative error)

 *	for all x and M=np. In particular for x/np close to 1, direct

 *	evaluation fails, and evaluation is based on the Taylor series

 *	of log((1+v)/(1-v)) with v = (x-M)/(x+M) = (x-np)/(x+np).

 * */


const {isFinite:R_FINITE, MIN_VALUE: DBL_MIN, NaN} = Number;
const { abs:fabs, log} = Math;


export function bd0(x: number, np: number): number {
  let ej: number;

  let s: number;

  let s1: number;

  let v: number;

  let j: number;

  if (!R_FINITE(x) || !R_FINITE(np) || np === 0.0) {
    return NaN;
  }

  if (fabs(x - np) < 0.1 * (x + np)) {
    v = (x - np) / (x + np); // might underflow to 0

    s = (x - np) * v; // s using v -- change by MM

    if (fabs(s) < DBL_MIN) return s;

    ej = 2 * x * v;

    v = v * v;

    for (j = 1; j < 1000; j++) {
      // Taylor series; 1000: no infinite loop

      //				as |v| < .1,  v^2000 is "zero"

      ej *= v; // = v^(2j+1)

      s1 = s + ej / ((j << 1) + 1);

      if (s1 === s)
        //* last term was effectively 0

        return s1;

      s = s1;
    }
  }

  // else:  | x - np |  is not too small

  return x * log(x / np) + np - x;
}
