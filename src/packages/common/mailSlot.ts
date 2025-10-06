import type { LoggerObjectController } from './upstairs';

// this is  a mailslot, maybe make proper mediator for this
let downstairsLoggerMailSlot: LoggerObjectController | undefined;

export function unRegisterLoggerBackend() {
    downstairsLoggerMailSlot = undefined;
}

export function getLoggerBackend() {
    return downstairsLoggerMailSlot;
}

export function registerLoggerBackend(downstairs: LoggerObjectController) {
    downstairsLoggerMailSlot = downstairs;
}