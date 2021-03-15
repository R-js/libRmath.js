import { IRNG, MessageType } from '../';
import { IRNGTypeEnum } from '../';
import { fixup, i2_32m1 } from '../fixup';

//import '../../../../../packages/jest-extension';
import '$jest-extension';

class MyIRNG extends IRNG {
    private _seed: Uint32Array;
    constructor() {
        super('my-irng', IRNGTypeEnum.USER_DEFINED);
        this._seed = new Uint32Array(0);
    }
    random(): number {
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
        const mockCallback = jest.fn(fn);
        usr.register(MessageType.INIT, mockCallback as typeof fn);
        usr.init(1234);
        expect(mockCallback.mock.calls[0][0]).toBe(1234);
    });
    it('test unregister specific callback', () => {
        const usr = new MyIRNG();
        const fn = (seed: number) => seed;
        const mockCallback = jest.fn(fn);
        usr.register(MessageType.INIT, mockCallback);
        usr.unregister(MessageType.INIT, mockCallback);
        usr.init(1234);
        expect(mockCallback).not.toHaveBeenCalled();
    });
    it('test unregister all callbacks', () => {
        const usr = new MyIRNG();
        const fn = (seed: number) => seed;
        const mockCallback = jest.fn(fn);
        usr.register(MessageType.INIT, mockCallback);
        usr.unregister(MessageType.INIT);
        usr.init(1234);
        expect(mockCallback).not.toHaveBeenCalled();
    });
    it('test register 2 callbacks and remove 1', () => {
        const usr = new MyIRNG();
        const fn = (seed: number) => seed;
        const mockCallback1 = jest.fn(fn);
        const mockCallback2 = jest.fn(fn);
        usr.register(MessageType.INIT, mockCallback1);
        usr.register(MessageType.INIT, mockCallback2);
        usr.init(1234); // both callbacks are called
        usr.unregister(MessageType.INIT, mockCallback1);
        usr.init(5678); // only 1 callback called
        expect(mockCallback1.mock.calls.length).toBe(1);
        expect(mockCallback2.mock.calls.length).toBe(2);
    });
    it('unregister nonexisting callback', () => {
        const usr = new MyIRNG();
        const fn = (seed: number) => seed;
        const mockCallback1 = jest.fn(fn);
        usr.unregister(MessageType.INIT, mockCallback1);
        usr.init(5678); // only 1 callback called
        expect(mockCallback1.mock.calls.length).toBe(0);
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
