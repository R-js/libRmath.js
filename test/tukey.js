//https://en.wikipedia.org/wiki/Studentized_range
//https://stat.ethz.ch/R-manual/R-devel/library/stats/html/Tukey.html

process.env.DEBUGx = 'dnt, pnt, pbeta, seq';
const libR = require('../dist/lib/libR.js');
const {
    Tukey,
    R: { arrayrify, seq: _seq, numberPrecision, map, sum }
} = libR;

//some usefull helpers
const log = arrayrify(Math.log);
const seq = _seq()();
const precision = numberPrecision(9); // restrict to 9 significant digits
const { pow, sqrt, abs } = Math;

const { qtukey, ptukey } = Tukey();

function doTest() {

    const fixture = {
        largeC: [110.1, 102.9, 93.1, 83.0, 83.3],
        midC: [299.8, 139.0, 131.2, 110.5, 129.2],
        smallC: [153.8, 139.8, 138.3, 121.4, 135.9],
        hybrid: [68.3, 67.1, 42.5, 40.0, 41.0],
        special: [181.6, 159.3, 138.3, 132.6, 135.7]
    };

    const N = sum(map(fixture)(v => v.length));
    const k = sum(map(fixture)(v => 1));
    const v = N - k;
    const n = N / k;

    const means = map(fixture)((v, key) => ({ key, v })).reduce((obj, sl) => {
        obj[sl.key] = sum(sl.v) / sl.v.length;
        return obj;
    }, {});

    const SSM = map(means)((mean, key) => {
        const error = sum(fixture[key].map(t => pow(mean - t, 2)));
        return error;
    });

    const s2 = sum(SSM) / v; //v = N-k
    const std = sqrt(s2 / n);

    const perm = function() {
        const rc = new Map();
        for (let prop1 in means) {
            for (let prop2 in means) {
                if (prop1 === prop2) {
                    continue;
                }
                let key = `${prop1}${prop2}`.split('').sort().join('');
                if (rc.has(key)) {
                    continue;
                }
                rc.set(key, { label: `${prop1}-${prop2}`, d: means[prop1] - means[prop2] });
            }
        }


        return Array.from(rc.values()).map(r => {
            //return r;
            r['sig'] = 1 - ptukey(abs(r.d) / std, 5, 20);
            r['low'] = r.d - std * qtukey(0.95, 5, 20);
            r['high'] = r.d + std * qtukey(0.95, 5, 20);
            return r;
        });
    }();




    return ({ s2, std, means, SSM, fixture, n, perm });
}

const data = doTest();