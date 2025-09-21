import { LoggerObjectController } from "./debug-frontend";

export default class DefaultObjectLogger implements LoggerObjectController {

    constructor(
        private readonly prefix: string | undefined,
        private readonly logs: unknown[],
        private readonly namespaces = {}
    ) { }

    isEnabled(namespace: string): boolean {
        return (namespace in this.namespaces);
    }
    send<T extends new (...args: any) => Error>(namespace: string, constructor: T, ...args: ConstructorParameters<T>): void {
        if (!this.isEnabled(namespace)) {
            return;
        }
        const obj = new constructor(...args);
        const finalNamespace = this.prefix ? `${this.prefix}/${namespace}` : namespace;
        this.logs.push({ ns: `${finalNamespace}`, obj });
    }
}