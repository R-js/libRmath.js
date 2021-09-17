import type debug from 'debug';

jest.mock('debug', () => {
    // Require the original module to not be mocked...
    const originalModule = jest.requireActual('debug');
    const createDebugger = originalModule.debug as typeof debug;
    const map = new Map<string, string[][]>();

    return {
        __esModule: true, // Use it when dealing with esModules
        debug(ns: string) {
            const lines: string[][] = [];
            const printer = createDebugger(ns);
            map.set(ns, lines);
            return function (...args: string[]) {
                lines.push(args);
                const [fmt, ...rest] = args;
                printer(fmt, ...rest);
            };
        },
        get(ns: string) {
            return map.get(ns);
        },
        clear(ns: string) {
            const lines = map.get(ns);
            if (lines) {
                lines.splice(0);
            }
        }
    };
});