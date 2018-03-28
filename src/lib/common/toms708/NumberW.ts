

export class NumberW {
  private _val: number;
  constructor(v: number = 0) {
    this._val = v;
  }
  get val() {
    return this._val;
  }
  set val(a: number) {
    if (Number.isNaN(a)) {
      throw new Error(`trying to set NaN, old value:${this._val}`);
    }
    this._val = a;

  }
}

