import { expect } from 'chai';
import { AhrensDieter } from '../../../src/lib/rng/normal/ahrens_dieter'
import { SuperDuper } from '../../../src/lib/rng/super-duper'
import { forcePrecision } from '../../../src/lib/r-func'
import { IRNG } from '../../../src/lib/rng';
import { flatten } from '../../../src/lib/r-func'

// Possible to arbitraty uniform PRNG source (example: SuperDuper)
const ad = new AhrensDieter(new SuperDuper());
// At any time reset normal PRNG seed, with the reference to uniform PRNG

const fixtureR = {
  case0: {
    seed: 1234,
    skipSamples: 100,
    sample: [
      0.964351021156036,
      -0.387654302265539,
      0.0877646797087241,
      0.896942205606656,
      -0.888795552820568,
      1.02636754601755,
      0.282572359450309,
      1.53394375984765,
      0.170351088479895,
      -1.70553912732225,
      0.318734395214424,
      -0.710202482884365,
      0.257280468792887,
      0.335965789677881,
      -2.4065851794791,
      -0.008540354490623,
      -0.53979728604102,
      0.223392724875927,
      1.24904997846272,
      1.10733939372422,
      0.104037545185853,
      -0.208581111418065,
      -0.686137030887194,
      0.530525922325635,
      -1.37043135932182,
      0.864915288336359,
      0.70629084899997,
      -0.946234787305188,
      -0.0108628689356156,
      -1.03071134976855,
      1.93593664304422,
      1.79881913715987,
      0.421733285134679,
      1.08808432426658,
      -0.690368775221556,
      -3.02089881320561,
      -2.17417794021011,
      -0.0454371749214666,
      0.821404471055097,
      0.720075780671434,
      -0.496902330938897,
      -1.04929428561756,
      -1.69495174544477,
      0.696408319987204,
      0.316291393282448,
      -0.458738219395988,
      -1.00756057211819,
      -0.678957651635561,
      0.47543760671805,
      1.28394155886706
    ],
    state: [-1514673429, -820558777]

  },
  case1: {
    seed: undefined,
    skipSamples: 0,
    sampleSize: 50,
    state: [102, 228735917, -233608999]
  },
  case2: {
    seed: 12,
    skipSamples: 0,
    sampleSize: [0.237462400371995, 0.552551444748545, 0.334121611279929, 0.914266223300776,
      0.151883158169660, 0.197006959979657]
  }
}



const _10 = forcePrecision(15)

describe('rng ahrens-dieter', function n() {

  it('rng superduper, seed=1234, skip=100, sample=50', () => {
    ad.rng.init(1234)
    ad.norm_rand(100)
    const sample = ad.norm_rand(50)
    const state = ad.rng.seed
    expect(_10(sample)).to.deep.equal(_10(fixtureR.case0.sample))
    expect(_10(state)).to.deep.equal(_10(fixtureR.case0.state))
  })

  it('internal functions of IRNGNormal', () => {
    ad.rng.init(12)
    const sample = ad.internal_norm_rand()
    const usample = ad.rng.internal_unif_rand()
    const usample2 = ad.rng.unif_rand(4)
    expect(_10([sample, usample, ...usample2])).to.deep.equal(fixtureR.case2.sampleSize)
  })
  it('IRNGNormal.norm_rand(-1)', () => {
    const usample = ad.norm_rand(0)
    expect(usample).to.deep.equal([])
  })
})