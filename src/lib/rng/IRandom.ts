export interface IRandom {
    random(): number;
    randoms(n: number): Float32Array;
}
