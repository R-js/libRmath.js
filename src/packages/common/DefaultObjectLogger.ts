import { Channel, LoggerObjectController } from "./upstairs";

export default class DefaultObjectLogger implements LoggerObjectController {

    constructor(
        private readonly prefix: string | undefined,
        private readonly logs: unknown[],
        private readonly namespaces?: Record<string, true>
    ) { }
    send(namespace: string, channel: Channel, interpolated: string): void {
        if (!this.isEnabled(namespace)) {
            return;
        }
        const finalNamespace = this.prefix ? `${this.prefix}/${namespace}` : namespace;
        this.logs.push({ ns: finalNamespace, channel, msg: interpolated });
    }

    isEnabled(namespace: string): boolean {
        if (!this.namespaces) {
            return true;
        }
        return (namespace in this.namespaces);
    }
    sendObject<T extends abstract new (...args: any) => Error>(namespace: string, constructor: T, ...args: ConstructorParameters<T>): void {
        if (!this.isEnabled(namespace)) {
            return;
        }
        const obj = new (constructor as any)(...args);
        const finalNamespace = this.prefix ? `${this.prefix}/${namespace}` : namespace;
        this.logs.push({ ns: finalNamespace, obj });
    }
}