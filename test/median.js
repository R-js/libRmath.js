const libR = require('../dist/lib/libR');
const {
    Normal,
    R: { flatten, seq, arrayrify, summary, isOdd, map }
} = libR;

const { trunc, sqrt } = Math;
// large sample size approximation with z.
//median test
const data = {
    tireI: [34, 32, 37, 35, 42, 43, 47, 58, 59, 62, 69, 71, 78, 84],
    tireII: [39, 48, 54, 65, 70, 76, 87, 90, 111, 118, 126, 127]
};

const { pnorm, qnorm, dnorm, rnorm } = Normal();

function medianTest2Sample() {
    const combined = [];
    for (prop in data) {
        combined.push(...data[prop].map(d => ({ tag: prop, value: d })));
    }

    let sorted = combined.sort((a, b) => a.value - b.value);
    let N = sorted.length;
    let median = (isOdd(N)) ? sorted[(N + 1) / 2].value : (sorted[N / 2].value + sorted[N / 2 - 1].value) / 2;

    console.log(`median found:${median}`);
    sorted = sorted.filter(f => f.value !== median); //filter out the values that are the same

    const pop1 = sorted.filter(f => f.tag === 'tireI');
    const pop2 = sorted.filter(f => f.tag === 'tireII');

    //some stats
    const n1 = pop1.length;
    const n2 = pop2.length;
    const n = n1 + n2;

    const N1b = pop1.filter(f => f.value < median).length;
    const N2b = pop2.filter(f => f.value < median).length;
    const Nb = N1b + N2b;

    const N1a = n1 - N1b;
    const N2a = n2 - N2b;
    const Na = N1a + N2a;

    const mu = n1 * Na / n;
    const variance = n1 * (Na) * (Nb) * n2 / (n * n * (n - 1));


    const z = (N1a - mu) / sqrt(variance);
    const p = pnorm(z, 0, 1, true);

    const obj = { variance, mu, Na, Nb, N1b, N2b, N1a, N2a, n, n1, n2, median, z, p };

    map(obj)((val, key) => console.log(`${key}=${val}`));

}

medianTest2Sample();