export const fixture = {
    Rcycle: {
        case0: {
            input: {
                fn: v=>v,
                args: 5 
            },
            expected: [5]
        },
        case1: {
            input: {
                fn: v=>v,
                args: []
            },
            expected: []
        },
        case2: {
            input: {
                fn: (v1,v2,v3,v4)=>`${v1}${v2}${v3}${v4}`,
                args: [1,2,[2,3],'hello']
            },
            expected: ['122h','123e','122l','123l','122o']
        }
    }
}
