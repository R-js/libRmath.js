import { INormal, Normal } from '../normal';
import { dgamma } from './dgamma';
import { gammafn } from './gamma_fn';
import { lgammafn } from './lgamma_fn';
import { pgamma } from './pgamma';
import {
  digamma,
  pentagamma,
  psigamma,
  tetragamma,
  trigamma
} from './polygamma';
import { qgamma } from './qgamma';
import { rgamma as _rgamma } from './rgamma';

export const special = {
  digamma,
  gamma: gammafn,
  lgamma: lgammafn,
  pentagamma,
  psigamma,
  tetragamma,
  trigamma
};

export function Gamma(norm: INormal = Normal()) {
  return {
    dgamma: (
      x: number | number[],
      shape: number = 1,
      scale: number = 1,
      giveLog: boolean = false
    ) => dgamma(x, shape, scale, giveLog),
    rgamma: (n: number = 1, shape: number = 1, scale: number = 1) =>
      _rgamma(n, shape, scale, norm),
    pgamma: (
      q: number | number[],
      shape: number = 1,
      scale: number = 1,
      lowerTail: boolean = true,
      logP: boolean = false
    ) => pgamma(q, shape, scale, lowerTail, logP),
    qgamma: (
      p: number | number[],
      shape: number = 1, //named shape
      scale: number = 1, //not the "rate"
      lowerTail: boolean = true,
      logP: boolean = false
    ) => qgamma(p, shape, scale, lowerTail, logP)
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
