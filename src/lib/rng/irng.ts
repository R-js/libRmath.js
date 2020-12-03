'use strict'
/* This is a conversion from libRmath.so to Typescript/Javascript
Copyright (C) 2018  Jacob K.F. Bogers  info@mail.jacob-bogers.com

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
import { IRNGType } from './irng-type';

export abstract class IRNG {
  protected _name: string;
  protected _kind: IRNGType;

  constructor(_seed: number, name: string, kind: IRNGType) {
    this._name = name;
    this._kind = kind;
  }

  public get name() {
    return this._name;
  }

  public get kind() {
    return this._kind;
  }

  public abstract init(seed: number): void;
  
  public unif_rand(n: number): Float32Array {
    n = (!n || n < 0) ? 1 : n;
    const rc = new Float32Array(n);
    for (let i = 0; i< n; n++){
      rc[i] = this.internal_unif_rand();
    }
    return rc;
  }
  
  
  public abstract get seed(): number[];
  public abstract set seed(_seed: number[]);

  protected abstract internal_unif_rand(): number;

}
