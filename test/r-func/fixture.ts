export const fixture = {
    Rcycle: {
        case0: {
            input: {
                fn: v => v,
                args: 5
            },
            expected: [5]
        },
        case1: {
            input: {
                fn: v => v,
                args: []
            },
            expected: []
        },
        case2: {
            input: {
                fn: (v1, v2, v3, v4) => `${v1}${v2}${v3}${v4}`,
                args: [1, 2, [2, 3], 'hello']
            },
            expected: ['122h', '123e', '122l', '123l', '122o']
        },
        case3: {
            input: {
                fn: function fn() { return Array.from(arguments) },
                args: [1, 2, [true, false], [undefined, null], ['ti', 'ta', 'tovenaar']]
            },
            expected: [
                [1, 2, true, undefined, 'ti'],
                [1, 2, false, null, 'ta'],
                [1, 2, true, undefined, 'tovenaar']
            ]
        },
        case4: {
            input: {
                fn: function fn() { return Array.from(arguments) },
                args: [[1, 2], true, undefined, null, 'tov']
            },
            expected: [
                [1, true, undefined, null, 't'],
                [2, true, undefined, null, 'o'],
                [1, true, undefined, null, 'v']
            ]
        }
    },
    RcycleErr: {
        err0: {
            input: {
                fn: function fn() { return Array.from(arguments) },
                args: [{}, true]
            },
            expected: {
                type: Error,
                msg: 'M001, Looping over properties not yet supported'
            }
        },
        err1: {
            input: {
                fn: function fn() { return Array.from(arguments)},
                args: [()=>{}, true]
            },
            expected: {
                type: Error,
                msg: 'M002, arguments of type "function" are not yet supported'
            }
        },
    },
    combine: {
        case0: {
            input: {
                args: [5,[1,2],'hello', ['world']]
            },
            expected: [5,1,2,'hello','world']
        }
    }
}

