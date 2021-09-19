export function prob2mu(size: number, prob: number): number {
    return prob / (1 - prob) * size;
}
