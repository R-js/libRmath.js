'use strict';

import { IRNG, MessageType } from '@rng/irng';
import type { IRNGNormalType } from '@lib/rng/normal/rng-types';

//normal/in01-type';
import type { IRandom } from '@rng/IRandom';

export abstract class IRNGNormal implements IRandom {
    public static kind: IRNGNormalType;

    protected _rng!: IRNG;
    protected _name: string;

    // some normal rng's have internal state
    protected reset(rng?: IRNG): void {
        if (rng && rng.name !== this._rng.name) {
            this._rng = rng;
        }
    }

    constructor(_rng: IRNG, name: string) {
        if (this.constructor.name === 'IRNGNormal') {
            throw new TypeError(`Cannot instantiate class "IRNGNormal" directly`);
        }
        this._name = name;
        this.register = this.register.bind(this);
        this.unregister = this.unregister.bind(this);
        this.register(_rng);
    }

    public unregister(): void {
        // unregister is "bound" so we can us init here
        // eslint-disable-next-line @typescript-eslint/unbound-method
        this._rng.unregister(MessageType.INIT, this.reset);
    }

    public register(_rng: IRNG): void {
        this._rng = _rng; // overwrite
        this.random = this.random.bind(this);
        this.randoms = this.randoms.bind(this);
        this.reset = this.reset.bind(this);
        // it IS bound, above line...
        // eslint-disable-next-line @typescript-eslint/unbound-method
        this._rng.register(MessageType.INIT, this.reset);
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
        throw new Error(`override this function in ${this.constructor.name}`);
    }

    public get name(): string {
        return this._name;
    }

    public get uniform_rng(): IRNG {
        return this._rng;
    }
}
