// base object being wrapped is normal Error

export default class VariableArgumentError extends Error {
    constructor(readonly template: string, ...args: unknown[]) {
        super(format(template, ...args));
    }
}

function format(fmt: string, ...args: unknown[]) {
    let i = 0;
    return fmt.replace(/%[sdj%]/g, token => {
        if (token === '%%') return '%';           // literal %
        if (i >= args.length) return token;       // not enough args

        switch (token) {
            case '%s': return String(args[i++]);
            case '%d': return String(args[i++]);
            case '%j':
                try {
                    return JSON.stringify(args[i++]);
                } catch {
                    return '[Circular]';
                }
            default:
                return token;
        }
    });
}
