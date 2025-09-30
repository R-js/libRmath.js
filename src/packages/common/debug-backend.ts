import { register, registerObjectLogger } from '@common/debug-frontend';
import DefaultObjectLogger from './DefaultObjectLogger';

export function createDebugObjectLoggerBackend(logs: unknown[], enabledNameSpaces?: Record<string, true>) {
    return function (prefix?: string) {
        return new DefaultObjectLogger(prefix, logs, enabledNameSpaces);
    }
}

/** @deprecated */
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

/** @deprecated */
export type LogEntry = { namespace: string; formatter: string; args: unknown[] };

/** @deprecated */
export function createStatsFromLogs(logs: LogEntry[]) {
    const rc = {} as Record<string, number>;
    logs.reduce((col, obj) => {
        col[obj.namespace] = col[obj.namespace] ?? 0;
        col[obj.namespace]++;
        return col;
    }, rc);
    return rc;
}

export function createStatsFromObjectLogs(logs: { ns: string }[]) {
    const rc = {} as Record<string, number>;
    logs.reduce((col, obj) => {
        col[obj.ns] = col[obj.ns] ?? 0;
        col[obj.ns]++;
        return col;
    }, rc);
    return rc;
}


/** @deprecated */
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

export function createObjectLogHarnas(allowedNS?: Record<string, true>) {
    const logs: { ns: string }[] = [];
    registerObjectLogger(createDebugObjectLoggerBackend(logs, allowedNS), /*optional prefix namespace 'stand-alone'*/);
    return {
        logs,
        getStats() {
            return createStatsFromObjectLogs(logs);
        }
    }
}