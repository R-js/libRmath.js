export default class DomainError extends Error {
    constructor(readonly domain: string) {
        super(`argument out of domain in ${domain}`);
    }
}
