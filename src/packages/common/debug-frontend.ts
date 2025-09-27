export type Printer = {
    (formatter: string, ...args: any[]): void;
    enabled: boolean;
};

export type PrintObject = {
    <T extends abstract new (...args: any) => Error>(
        formatter: T,
        ...args: ConstructorParameters<T>
    ): void;
}

export type LoggerController = {
    send(namespace: string, formatter: string, ...args: any[]): void;
    isEnabled(namespace?: string): boolean;
};

export type LoggerObjectController = {
    send<T extends abstract new (...args: any) => Error>(namespace: string, formatter: T, ...args: ConstructorParameters<T>): void;
    isEnabled(namespace: string): boolean;
};

let controller: LoggerController | undefined;

let objectController: LoggerObjectController | undefined;

export function register(backend: (prefix?: string) => LoggerController, prefix?: string) {
    controller = backend(prefix);
    return controller;
}

export function registerObjectLogger(backend: (prefix?: string) => LoggerObjectController, prefix?: string) {
    objectController = backend(prefix);
    return controller;
}

export function unRegister() {
    controller = undefined;
}

export function unRegisterObjectController() {
    objectController = undefined;
}

/* @deprecated */
export default function createNs(ns: string): Printer {
    function print(formatter: string, ...args: any[]) {
        if (!controller) {
            return;
        }
        if (controller.isEnabled(ns)) {
            controller.send(ns, formatter, ...args);
        }
    }
    Object.defineProperties(print, {
        enabled: {
            get() {
                if (!controller) {
                    return false;
                }
                return controller.isEnabled(ns);
            },
            enumerable: true
        }
    });
    return print as Printer;
}

function createPrinter(downStairs: LoggerObjectController, ns: string): PrintObject {
    return function <T extends abstract new (...args: any) => Error>(formatter: T, ...args: ConstructorParameters<T>) {
        if (downStairs.isEnabled(ns)) {
            downStairs.send(ns, formatter, ...args);
        }
    }
}
// return print as PrintObject;

export type LoggerEnhanced = undefined | {
    printer?: PrintObject;
};

export function decorateWithLogger<T extends (...args: any) => ReturnType<T>>(fn: T, printName = 'printer') {
    return function (...args: Parameters<T>): ReturnType<T> {
        // pull in mailslot value dynamically (objectController is a global)
        const downStairsLogger = objectController;

        // performance: only create if needed
        // check if the slot is free and downStairsLogger is defined
        if (!this?.[printName] && downStairsLogger) {
            const ctx = this ?? Object.create(null);
            ctx[printName] = createPrinter(downStairsLogger, fn.name);
            return fn.call(ctx, ...args);
        }
        return fn(...args);
    }
}

export function createObjectNs(ns: string): PrintObject {
    function print<T extends new (...args: any) => Error>(formatter: T, ...args: ConstructorParameters<T>) {
        if (!objectController) {
            return;
        }
        if (objectController.isEnabled(ns)) {
            objectController.send(ns, formatter, ...args);
        }
    }
    return print as PrintObject;
}