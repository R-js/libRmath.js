import { IRNGType } from './irng-type'

const { isArray } = Array

export function seedCheck(rngName: IRNGType, seed: number[], length: number): void | never {

    if (!isArray(seed)) {
        throw new TypeError(`the seed is not of type Array for rng:${IRNGType[rngName]}`)
    }

    if (seed.length !== length) {
        throw new TypeError(`the seed is not an array of proper size for rng ${IRNGType[rngName]}`)
    }
    const errors = seed.filter(f => typeof f !== 'number' || !Number.isSafeInteger(f))
    if (errors.length > 0){
        throw new TypeError(`${IRNGType[rngName]}: some seed items were not of type "integer": ${JSON.stringify(errors)}`)
    }
}

