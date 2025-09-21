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
    send<T extends new (...args: any) => Error>(namespace: string, formatter: T, ...args: ConstructorParameters<T>): void;
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


export function createObjectNs(ns: string): PrintObject {
    function print<T extends new (...args: any) => Error>(formatter: T, ...args: ConstructorParameters<T>) {
        if (!objectController) {
            return;
        }
        if (objectController.isEnabled(ns)) {
            objectController.send(ns, formatter, ...args);
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
    return print as PrintObject;
}