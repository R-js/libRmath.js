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

type WCache = {
  [index: number]: WCache
}
|
{
  [index: number]: number
}

export class WilcoxonCache {

  //private _map = new Map<number, Map<number, Map<number, number>>>();
  private _map2: WCache = {};

  public get(i: number, j: number, k: number): number | undefined {
    /*const jMap = this._map.get(i);
    if (jMap) {
      const kMap = jMap.get(j);
      if (kMap) {
        return kMap.get(k);
      }
    }
    return undefined;*/
    const jstruct = this._map2[i];
    if (jstruct !== undefined) {
      const kstruct = (jstruct as WCache)[j];
      if (kstruct !== undefined) {
        return (kstruct as WCache)[k] as number;
      }
    }
    return undefined;
  }

  public set(i: number, j: number, k: number, value: number): void {
    /*
    USING old fashioned way of simple objects to mimic key-value mapping
    DONT USE: new Map(), it will cause performance problems
    
    let jMap = this._map.get(i);
    if (!jMap) {
      jMap = new Map();  
      this._map.set(i, jMap);
    }
    let kMap = jMap.get(j);
    if (!kMap) {
        kMap = new Map();
        jMap.set(j, kMap);
    }
    kMap.set(k, value);*/
    let jstruct = this._map2[i];
    if (jstruct === undefined) {
      jstruct = {};
      this._map2[i] = jstruct;
    }
    let kstruct = (jstruct as WCache)[j];
    if (kstruct === undefined) {
      kstruct = {};
      (jstruct as WCache)[j] = kstruct;
    }
    (kstruct as WCache)[k] = value;
  }
}
