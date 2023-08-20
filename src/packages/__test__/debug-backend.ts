import type { LoggerController } from '@mangos/debug-frontend';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type MockLogs = { prefix: string; namespace: string; formatter: string; args: any[] };

export default function createBackEndMock(logs: MockLogs[]) {
    return (prefix = ''): LoggerController => ({
        send(namespace: string, formatter: string, ...args: any[]) {
            logs.push({ prefix, namespace, formatter, args });
        },
        isEnabled(_namespace: string) {
            return true;
        }
    });
}
