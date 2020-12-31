import { IRNGTypeEnum } from './irng-type'

export function seedCheck(rngName: IRNGTypeEnum, seed: Uint32Array, length: number): void | never {

    if (!(seed instanceof Uint32Array)) {
        throw new TypeError(`the seed is not of type Array for rng:${IRNGTypeEnum[rngName]}`)
    }

    if (seed.length !== length) {
        throw new TypeError(`the seed is not an array of proper size for rng ${IRNGTypeEnum[rngName]}`)
    }
    const errors = seed.filter(f => typeof f !== 'number' || !Number.isSafeInteger(f))
    if (errors.length > 0){
        throw new TypeError(`${IRNGTypeEnum[rngName]}: some seed items were not of type "integer": ${JSON.stringify(errors)}`)
    }
}

