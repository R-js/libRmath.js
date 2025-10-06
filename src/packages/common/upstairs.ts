import { getLoggerBackend } from "./mailSlot";

// biome-ignore lint/suspicious/noExplicitAny: args is a mixed type array
export type PrintObject = <T extends abstract new (...args: any[]) => Error>(
    formatter: T,
    ...args: ConstructorParameters<T>
) => void;

// biome-ignore lint/suspicious/noExplicitAny: args is a mixed type array
export type Printer = (formatter: string | ((...args: any[]) => string), ...args: any[]) => void;

export type Channel = 'warn' | 'info' | 'debug' | 'error';

export type LoggerObjectController = {
    // biome-ignore lint/suspicious/noExplicitAny: args is a mixed type array
    isEnabled(namespace: string): boolean;
    sendObject<T extends abstract new (...args: any[]) => Error>(
        namespace: string,
        formatter: T,
        ...args: ConstructorParameters<T>
    ): void;
    send(namespace: string, channel: Channel, formatter: string | ((...args: any[]) => string), ...args: any[]): void;
};

export type LoggerEnhanced =
    | undefined
    | {
        errorObject: PrintObject;
        error: Printer;
        warn: Printer;
        info: Printer;
        debug: Printer;
    };

// biome-ignore lint/suspicious/noExplicitAny: args is a mixed type array
export function decorateWithLogger<T extends (...args: any[]) => ReturnType<T>>(
    fn: T,
) {
    const objectNullProto: Omit<LoggerEnhanced, 'undefined'> = Object.create(null);

    return (...args: Parameters<T>): ReturnType<T> => {

        const downStairsLoggerRefCopy = getLoggerBackend();

        if (downStairsLoggerRefCopy === undefined) {
            return fn(...args);
        }
        if (!downStairsLoggerRefCopy.isEnabled(fn.name)) {
            return fn(...args);
        }

        const ctx = Object.assign<Omit<LoggerEnhanced, 'undefined'>, LoggerEnhanced>(objectNullProto, {
            errorObject(formatter, ...argsPrinter) {
                downStairsLoggerRefCopy.sendObject(
                    fn.name,
                    formatter,
                    ...argsPrinter,
                );
            },
            error(formatter, ...argsPrinter) {
                downStairsLoggerRefCopy.send(
                    fn.name,
                    'error',
                    formatter,
                    ...argsPrinter
                );
            },
            warn(formatter, ...argsPrinter) {
                downStairsLoggerRefCopy.send(
                    fn.name,
                    'warn',
                    formatter,
                    ...argsPrinter
                );
            },
            info(formatter, ...argsPrinter) {
                downStairsLoggerRefCopy.send(
                    fn.name,
                    'info',
                    formatter,
                    ...argsPrinter,
                );
            },
            debug(formatter, ...argsPrinter) {
                downStairsLoggerRefCopy.send(
                    fn.name,
                    'debug',
                    formatter,
                    ...argsPrinter,
                );
            },
        });
        return fn.call(ctx, ...args);
    };
}
