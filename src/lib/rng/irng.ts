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

export type MessageType = 'INIT';

// cache it, make without create seq() every time
export const segFnCache = seq();

export abstract class IRNG {
  protected _name: string;
  protected _kind: IRNGType;

  private notify: Set<{ event: MessageType, handler: (...args:any[]) => void }>;

  constructor(_seed: number) {
    this.notify = new Set();
    this.emit = this.emit.bind(this);
    this.register = this.register.bind(this);
    this.unif_rand = this.unif_rand.bind(this);
    this.internal_unif_rand = this.internal_unif_rand.bind(this);
    this.init = this.init.bind(this);
    this._setup();
    this.init(_seed);
  }

  public get name() {
    return this._name;
  }

  public get kind() {
    return this._kind;
  }

  public abstract _setup(): void;

  public init(seed: number): void {
    this.emit('INIT', seed);
  }

  public abstract set seed(_seed: number[]);

  public unif_rand(): number;
  public unif_rand(n: 0 | 1): number;
  public unif_rand(n: number): number | number[];
  public unif_rand(n: number = 1): number | number[] {
    n = (!n || n < 0) ? 1 : n;
    return map(segFnCache()(n))(() => this.internal_unif_rand());
  }

  public abstract internal_unif_rand(): number;

  public abstract get seed(): number[];
  // event stuff
  public register(event: MessageType, handler: (...args:any[]) => void) {
    this.notify.add({ event, handler });
  }

  public emit(event: MessageType, ...args:any[]) {
    this.notify.forEach(r => {
      if (r.event === event) {
        r.handler.apply(r.handler, args);
      }
    });
  }
}
