export function prob2mu(size: number, prob: number): number {
    return prob / (1 - prob) * size;
}

export function mu2Prob(size: number, mu: number): number {
    const ms = mu / size;
    return ms / (1 + ms);
}