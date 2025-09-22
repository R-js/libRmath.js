export default class ConvergenceError extends Error {
    constructor(readonly domain: string) {
        super(`convergence failed in ${domain}`);
    }
}
