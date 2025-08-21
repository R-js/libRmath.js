import { IRNG, MessageType } from '../';
import type { IRNGType } from '../rng-types';
import { fixup, i2_32m1 } from '../fixup';

class MyIRNG extends IRNG {
    public static override kind: IRNGType = 'USER_DEFINED' as IRNGType; // force extra kind
    public get cut(): number {
        return 2 ** 25 - 1;
    }
    private _seed: Uint32Array;
    constructor() {
        super('my-irng');
        this._seed = new Uint32Array(0);
    }
    override random(): number {
        return Math.random();
    }
    get seed() {
        return this._seed;
    }
    set seed(_seed: Uint32Array) {
        return;
    }
}

describe('irng', function n() {
    it('test emitting event on init', () => {
        const usr = new MyIRNG();
        const fn = (seed: number) => seed;
        let calledWith = [];
        const mockCallback = (...args: any[]) => calledWith.push(args);
        usr.register(MessageType.INIT, mockCallback);
        usr.init(1234);
        expect(calledWith).toEqual(
            [
                [
                    usr,
                    1234
                ]
            ]
        );
    });

    it('test unregister specific callback', () => {
        const usr = new MyIRNG();
        const fn = (seed: number) => seed;
        let cnt = 0;
        const mockCallback = () => cnt++;
        usr.register(MessageType.INIT, mockCallback);
        usr.unregister(MessageType.INIT, mockCallback);
        usr.init(1234);
        expect(cnt).toBe(0); // mockCallback not called
    });

    it('test unregister all callbacks', () => {
        const usr = new MyIRNG();
        const fn = (seed: number) => seed;
        let cnt = 0;
        const mockCallback = () => cnt++;
        usr.register(MessageType.INIT, mockCallback);
        usr.unregister(MessageType.INIT);
        usr.init(1234);
        expect(cnt).toBe(0);
    });
    it('test register 2 callbacks and remove 1', () => {
        const usr = new MyIRNG();
        const fn = (seed: number) => seed;
        let cnt1 = 0;
        let cnt2 = 0;
        const mockCallback1 = () => cnt1++;
        const mockCallback2 = () => cnt2++;;
        usr.register(MessageType.INIT, mockCallback1);
        usr.register(MessageType.INIT, mockCallback2);
        usr.init(1234); // both callbacks are called
        usr.unregister(MessageType.INIT, mockCallback1);
        usr.init(5678); // only 1 callback called
        expect(cnt1).toBe(1); // called once
        expect(cnt2).toBe(2); // called twice
    });
    it('unregister nonexisting callback', () => {
        const usr = new MyIRNG();
        const fn = (seed: number) => seed;
        let cnt1 = 0;
        const mockCallback1 = () => cnt1++;
        usr.unregister(MessageType.INIT, mockCallback1);
        usr.init(5678);
        expect(cnt1).toBe(0); // not called
    });
});

describe('fixup', () => {
    it('correction if <=0', () => {
        const s = fixup(-1);
        expect(s).toEqualFloatingPointBinary(0.5 * i2_32m1, 30, false, true);
    });
    it('correction if >=1', () => {
        const s = fixup(2);
        expect(s).toEqualFloatingPointBinary(1 - 0.5 * i2_32m1, 30, false, true);
    });
});
