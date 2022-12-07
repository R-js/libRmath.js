// this is using the mock

type MockedDebug = typeof import('@mangos/debug') & {
    get: (ns: string) => string[][]| undefined;
    clear: (ns: string) => void;
}

const cl = require('@mangos/debug') as MockedDebug;


function select(ns: string) {
    return function (filter: string | RegExp) {
        return function (): string[][] {
            const logs = cl.get(ns); // put it here and not in the function closure
            if (!logs) return [];
            if (typeof filter === 'string') {
                return logs.filter(s => (s[0] === filter));
            }
            return logs.filter(s => filter.test(s[0]));
        };
    };
}

export { cl, select }