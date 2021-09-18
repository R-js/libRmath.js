import { IRNGTypeEnum } from "./irng-type";
import type { IRandom } from "./IRandom";
export declare enum MessageType {
    INIT = "@@INIT@@"
}
export declare class IRNG implements IRandom {
    protected _name: string;
    protected _kind: IRNGTypeEnum;
    private notify;
    constructor(name: string, kind: IRNGTypeEnum);
    get name(): string;
    get kind(): IRNGTypeEnum;
    randoms(n: number): Float32Array;
    random(): number;
    emit(event: MessageType, ...args: unknown[]): void;
    register(event: MessageType, handler: (...args: any[]) => void): void;
    unregister(event: MessageType, handler?: (...args: any[]) => void): void;
    get seed(): Uint32Array | Int32Array;
    set seed(_seed: Uint32Array | Int32Array);
    init(seed: number): void;
}
//# sourceMappingURL=irng.d.ts.map