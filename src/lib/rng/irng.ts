import type { IRNGType } from './rng-types';
import type { IRandom } from './IRandom';

export enum MessageType {
    INIT = '@@INIT@@',
}

export abstract class IRNG implements IRandom {
    protected _name: string;
    static readonly kind: IRNGType;
    private notify: Map<MessageType, ((...args: unknown[]) => void)[]>;

    //protected abstract random(): number;

    constructor(name: string) {
        this._name = name;
        this.notify = new Map();
        this.emit = this.emit.bind(this);
    }

    public get name(): string {
        return this._name;
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

    public register<F extends (...args: any[]) => void>(event: MessageType, handler: F): void {
        const handlers = this.notify.get(event) || [];
        this.notify.set(event, handlers);
        handlers.push(handler);
    }

    public unregister<F extends (...args: any[]) => void>(event: MessageType, handler?: F): void {
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

    public abstract get seed(): Uint32Array | Int32Array;
    public abstract set seed(_seed: Uint32Array | Int32Array);

    public init(seed: number): void {
        this.emit(MessageType.INIT, this, seed);
    }

    public abstract get cut(): number;
}
