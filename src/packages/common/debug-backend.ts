import { register } from '@common/debug-frontend';

export default function createDebugLoggerBackend(logs: unknown[]) {
    return function (prefix?: string) {
        const finalPrefix = prefix ? `${prefix}/` : '';
        return {
            send(namespace: string, formatter: string, ...args: string[]) {
                logs.push({ ...(finalPrefix && { prefix: finalPrefix }), namespace, formatter, args });
            },
            isEnabled(_namespace: string) {
                return true;
            },
        };
    }
}

export type LogEntry = { namespace: string; formatter: string; args: unknown[] };

export function createStatsFromLogs(logs: LogEntry[]) {
    const rc = {} as Record<string, number>;
    logs.reduce((col, obj) => {
        col[obj.namespace] = col[obj.namespace] ?? 0;
        col[obj.namespace]++;
        return col;
    }, rc);
    return rc;
}

export function createLogHarnas() {
    const logs: LogEntry[] = [];
    register(createDebugLoggerBackend(logs));
    return {
        logs,
        getStats() {
            return createStatsFromLogs(logs);
        }
    }
}