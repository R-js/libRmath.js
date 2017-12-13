
import { dgamma } from './dgamma';
import { qgamma } from './qgamma';
import { rgamma } from './rgamma';
import { pgamma } from './pgamma';
import { gammafn } from './gamma_fn';
import { lgammafn } from './lgamma_fn';
import { normal, INormal } from '../normal';
import {
  pentagamma,
  tetragamma,
  trigamma,
  digamma,
  psigamma
} from './polygamma';


export {

  //
  rgamma,
  pgamma,
  dgamma,
  qgamma,
  //
  gammafn,
  lgammafn
};

export const special = {
  gamma:gammafn,
  lgamma:lgammafn,
  pentagamma,
  tetragamma,
  trigamma,
  digamma,
  psigamma,
};

export interface IGamma {
  dgamma: (
    x: number | number[],
    shape: number,
    scale: number,
    giveLog: boolean
  ) => number | number[];
  rgamma: (n: number, shape: number, scale: number) => number | number[];
  pgamma: (
    q: number | number[],
    shape: number,
    scale: number,
    lowerTail: boolean,
    logP: boolean
  ) => number | number[];
  qgamma: (
    p: number | number[],
    shape: number, //named shape
    scale: number, //not the "rate"
    lowerTail: boolean,
    logP: boolean
  ) => number | number[];
}

export function gamma(norm: INormal = normal()): IGamma {
  return {
    dgamma: (
      x: number | number[],
      shape: number = 1,
      scale: number = 1,
      giveLog: boolean = false
    ) => dgamma(x, shape, scale, giveLog),
    rgamma: (n: number = 1, shape: number = 1, scale: number = 1) =>
      rgamma(n, shape, scale, norm),
    pgamma: (
      q: number | number[],
      shape: number = 1,
      scale: number = 1,
      lowerTail: boolean = true,
      logP: boolean = false
    ) => pgamma(q, shape, scale, lowerTail, logP, norm),
    qgamma: (
      p: number | number[],
      shape: number= 1, //named shape
      scale: number= 1, //not the "rate"
      lowerTail: boolean= true,
      logP: boolean= false) => qgamma(p, shape, scale, lowerTail, logP, norm)
  };
}

/**
 * 
 * export function rgamma(
    n: number = 1,
    a: number = 1,
    scale: number = 1 / a,
    normal: INormal
): number | number[] 

 * export function dgamma<T>(
  x: T,
  shape: number,
  scale: number = 1,
  give_log: boolean = false
): T {
 * 
 * 
 * export function pgamma<T>(
  xx: T,
  alph: number,
  scale: number,
  lowerTail: boolean,
  logP: boolean,
  normal: INormal
 * 
 */
