export default class UnderflowError extends Error {
    constructor(readonly domain: string) {
        super(`underflow occurred in  ${domain}`);
    }
}
