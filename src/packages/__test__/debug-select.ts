const cl = require('debug');

function select(ns: string) {
    return function (filter: string | RegExp) {
        return function (): string[] {
            const logs = cl.get(ns); // put it here and not in the function closure
            if (!logs) return [];
            if (typeof filter === 'string') {
                return logs.filter((s: string[]) => s[0] === filter);
            }
            return logs.filter((s: string[]) => filter.test(s[0]));
        };
    };
}

export { cl, select }