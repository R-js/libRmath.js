const pI = Infinity;
const nI = -Infinity;
export const fixture = {
    dbeta: {
        case0: {
            desc: 's1:2, s2:2, ncp:1, l:false, x=(0.4, NaN)',
            input: {
                x: [0.4, NaN],
                shape1: 2,
                shape2: 2,
                ncp: 1,
                asLog: false
            },
            output: [1.28724574, NaN]
        },
        case1: {
            desc: 's1:2,s2:2, ncp:1, l:false, x=c( seq(0,1,0.2), NaN)',
            input: {
                x: [0, 0.2, 0.4, 0.6, 0.8, 1, NaN],
                shape1: 2,
                shape2: 2,
                ncp: 0,
                asLog: false
            },
            output: [0.00, 0.96, 1.44, 1.44, 0.96, 0.00, NaN]
        },
        case2: {
            desc: 'edge cases x< 0, x > 1, shape1 < 0 shape2 < 0',
            input: {
                x: [-1, 0.5, 0.5, 0, 0.5, 0.5, 0, 0.5, 1, 0.5, 0],
                shape1: [2, -2, 1, 0, 0, 8, 8, 8, pI, pI, pI],
                shape2: [2, 2, -1, 0, 0, pI, pI, pI, 4, 4, pI],
                ncp: 0,
                asLog: false
            },
            output: [
                0,
                NaN,
                NaN,
                pI,
                0, //5 
                0,
                pI,
                0,
                pI,
                0, //10 
                0
            ]
        },
        case3: {
            desc: 'edge cases x = (0,1), shape1 = Infinity , shape2 = Infinity',
            input: {
                x: [0.5, 0, 0, 1, 1, 1],
                shape1: [pI, 0.5, 1, 3, 3, 9],
                shape2: [pI, 1, 8, 2, 0.5, 1],
                ncp: 0,
                asLog: false
            },
            output: [
                pI, pI, 8, 0, pI, 9
            ]
        },
        case4: {
            desc: 'shape1 <=2, shape2 <=2, x =(0,..,1), ncp=0, log=false',
            input: {
                x: [0.5, 0.2],
                shape1: [4, 6],
                shape2: [1.5, 6],
                ncp: 0,
                asLog: false
            },
            output: [
                0.8700727972, 0.2906652672
            ]
        }
    },
    pbeta: {

    },
    qbeta: {

    },
    rbeta: {

    }
};
