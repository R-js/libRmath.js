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
import { IRNGTypeEnum } from './irng-type';
import type { IRandom } from './IRandom';

export enum MessageType {
    INIT = '@@INIT@@',
}


export class IRNG implements IRandom {
    protected _name: string;
    protected _kind: IRNGTypeEnum;
    private notify: Map<MessageType, ((...args: unknown[]) => void)[]>;

    //protected abstract random(): number;

    constructor(name: string, kind: IRNGTypeEnum) {
        if (this.constructor.name === 'IRNG') {
            throw new TypeError('IRNG should be subclassed not directly instantiated');
        }
        this._name = name;
        this._kind = kind;
        this.notify = new Map();
        this.emit = this.emit.bind(this);

    }

    public get name(): string {
        return this._name;
    }

    public get kind(): IRNGTypeEnum {
        return this._kind;
    }

    public randoms(n: number): Float32Array {
        n = !n || n < 0 ? 1 : n;
        const rc = new Float32Array(n);
        for (let i = 0; i < n; i++) {
            rc[i] = this.random();
        }
        return rc;
    }

    random(): number {
        throw new Error(`override this function in ${this.constructor.name}`)
    }

    public emit(event: MessageType, ...args: unknown[]): void {
        const handlers = this.notify.get(event);
        if (handlers !== undefined) {
            handlers.forEach((h) => h(...args));
        }
    }

    public register(event: MessageType, handler: (...args: any[]) => void): void {
        const handlers = this.notify.get(event) || [];
        this.notify.set(event, handlers);
        handlers.push(handler);
    }

    public unregister(event: MessageType, handler?: (...args: any[]) => void): void {
        if (!handler) {
            this.notify.delete(event);
            return;
        }
        const handlers = this.notify.get(event);
        if (!handlers) {
            return;
        }
        const idx = handlers.indexOf(handler);
        if (idx >= 0) {
            handlers.splice(idx, 1);
            if (handlers.length === 0) {
                this.notify.delete(event);
            }
        }
    }

    public get seed(): Uint32Array | Int32Array {
        throw new Error(`override property getter 'seed' in ${this.constructor.name}`)
    }
    public set seed(_seed: Uint32Array | Int32Array) {
        throw new Error(`override property setter 'seed' in ${this.constructor.name}`)
    }

    public init(seed: number): void {
        this.emit(MessageType.INIT, seed);
    }
}
