import { IRNGTypeEnum } from './irng-type';

export function seedCheck(rngName: IRNGTypeEnum, seed: Uint32Array | Int32Array, length: number): void | never {
    if (!(seed instanceof Uint32Array || seed instanceof Int32Array)) {
        throw new TypeError(`the seed is not of type Array for rng:${rngName}`);
    }
    if (seed.length !== length) {
        throw new TypeError(`the seed is not an array of proper size for rng ${rngName}`);
    }
}
