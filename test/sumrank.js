const libR = require('../dist/lib/libR');
const {
    Normal,
    Wilcoxon,
    R: { flatten, seq, arrayrify, summary, isOdd, map, sum }
} = libR;

const { trunc, sqrt, min, max } = Math;

//Show usage of Rank Sum Test with tires weareoff replacement after X amount of milage driven
// S populations are given is the median the same??
const data = {
    tireI: [85, 99, 100, 110, 105, 87],
    tireII: [67, 69, 70, 93, 105, 90, 110, 115]
};

const { pnorm, qnorm, dnorm, rnorm } = Normal();
const { dwilcox, pwilcox, qwilcox, rwilcox } = Wilcoxon();

function decorateWithRank(dat) {
    let j = 0;
    let rank = 1;
    do {
        dat[j].rank = rank;
        let j2 = j + 1;
        for (; j2 < dat.length; j2++) { //peek ahead
            if (dat[j2].value !== dat[j].value) {
                break;
            }
        }
        j2--;
        if (j2 !== j) { // we can advance and skip over double values
            let grSize = (j2 - j) + 1;
            // N * rank + N * ( N - 1 ) / 2
            let rankSum = rank * grSize + grSize * (grSize - 1) / 2;
            let meanRSum = rankSum / grSize;
            //
            for (let i = j; i <= j2; i++) {
                dat[i].rank = meanRSum;
            }
            rank += grSize - 1;
            j = j2;
        }
        j++;
        rank++;
    } while (j < dat.length);
}

function sumRankSample() {
    const combined = [];
    for (prop in data) {
        combined.push(...data[prop].map(d => ({ tag: prop, value: d })));
    }
    //
    let sorted = combined.sort((a, b) => a.value - b.value);
    //
    decorateWithRank(sorted);
    //
    let N = sorted.length;
    //
    const pop1 = sorted.filter(f => f.tag === 'tireI');
    const pop2 = sorted.filter(f => f.tag === 'tireII');

    //some stats
    const n1 = min(pop1.length, pop2.length);
    const n2 = max(pop1.length, pop2.length);
    const R = sum(pop2.map(v => v.rank));
    const W = R - 0.5 * n2 * (n2 + 1);
    const q1 = qwilcox(0.025, n1, n2);
    const p1 = pwilcox(q1, n1, n2);
    const q2 = qwilcox(p1, n1, n2, false);
    const p2 = pwilcox(q2, n1, n2, false);
    const ta = p1 + p2;
    console.log(`Report:
W:${W},alpha:0.05 (approximation, because the quantiles are integers), twosided 
q(0.025,${n1},${n2})=${q1},
p(${q1},${n1},${n2})=${p1}
q(${p1}, ${n1},${n2}, false)=${q2}
p(${q2},${n1},${n2}, false)=${p2}
total alpha:${ta}
`);
}

sumRankSample();