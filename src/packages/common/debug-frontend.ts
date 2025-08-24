export type Printer = {
    (formatter: string, ...args: any[]): void;
    readonly namespace: string;
    readonly enabled: boolean;
};

export type LoggerController = {
    send(namespace: string, formatter: string, ...args: any[]): void;
    isEnabled(namespace?: string): boolean;
};

let controller: LoggerController | undefined;

export function register(backend: (prefix?: string) => LoggerController, prefix?: string) {
    controller = backend(prefix);
    return controller;
}

export function unRegister() {
    controller = undefined;
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