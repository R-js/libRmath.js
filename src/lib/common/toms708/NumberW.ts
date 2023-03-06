export class NumberW {
    private _val: number;
    constructor(v = 0) {
        this._val = v;
    }
    get val(): number {
        return this._val;
    }
    set val(a: number) {
        if (Number.isNaN(a)) {
            throw new Error(`trying to set NaN, old value:${this._val}`);
        }
        this._val = a;
    }
}
