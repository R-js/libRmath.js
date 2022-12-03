//import type debug from 'debug';

jest.setTimeout(100000);

jest.mock('debug', () => {
    // Require the original module to not be mocked...
    const originalModule = jest.requireActual('debug');
    const createDebugger = originalModule.debug;
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



jest.mock('@mangos/debug', () => {
    // Require the original module to not be mocked...
   
    const originalModule = jest.requireActual('@mangos/debug');
    
    const map = new Map<string, string[][]>();

    function debug(ns: string) {
        const lines: string[][] = [];
        const printer = originalModule.debug(ns);
        map.set(ns, lines);
        function debug_printer (...args: string[]) {
            lines.push(args);
            const [fmt, ...rest] = args;
            printer(fmt, ...rest);
        }
        debug_printer.enabled = true;
        return debug_printer;
    }

   

    return {
        __esModule: true, // Use it when dealing with esModules
        debug,
        evalAllNS(...args: unknown[]){
            return originalModule.evalAllNS(...args);
        },
        getLineInfo(n: number){
            return originalModule.getLineInfo(n+1);
        },
        get(ns: string) {
            return map.get(ns);
        },
        clear(ns: string) {
            const lines = map.get(ns);
            if (lines) {
                lines.splice(0);
            }
        },
        
    };
})

