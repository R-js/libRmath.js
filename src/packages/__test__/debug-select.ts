const cl = require('debug');

function select(ns: string) {
    return function (filter: string) {
        return function (): string[] {
            const logs = cl.get(ns); // put it here and not in the function closure
            if (!logs) return [];
            return logs.filter((s: string[]) => s[0] === filter);
        };
    };
}

export { cl , select }