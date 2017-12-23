export class WilcoxonCache {
  
  private _map = new Map<number, Map<number, Map<number, number>>>();
  
  constructor() {

  }

  public get(i: number, j: number, k: number): number | undefined {
    const jMap = this._map.get(i);
    if (jMap) {
      const kMap = jMap.get(j);
      if (kMap) {
        return kMap.get(k);
      }
    }
    return undefined;
  }

  public set(i: number, j: number, k: number, value: number ){
    let jMap = this._map.get(i);
    if (!jMap) {
      jMap = new Map();  
      this._map.set(i, jMap);
    }
    let kMap = jMap.get(j);
    if (!kMap) {
        kMap = new Map();
        jMap.set(j, kMap);
    }
    kMap.set(k, value);
  }
}
