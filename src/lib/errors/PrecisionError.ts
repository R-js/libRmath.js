export default class PrecisionError extends Error {
    constructor(readonly domain: string) {
        super(`full precision may not have been achieved in ${domain}`);
    }
}
