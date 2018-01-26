export class WilcoxonCache {
  
  //private _map = new Map<number, Map<number, Map<number, number>>>();
  private _map2 = {};
  constructor() {

  }

  public get(i: number, j: number, k: number): number | undefined {
    /*const jMap = this._map.get(i);
    if (jMap) {
      const kMap = jMap.get(j);
      if (kMap) {
        return kMap.get(k);
      }
    }
    return undefined;*/
    const jstruct = this._map2[i];
    if (jstruct !== undefined){
      const kstruct = jstruct[j];
      if (kstruct !==  undefined ){
        return kstruct[k];
      }
    }
    return undefined;
  }

  public set(i: number, j: number, k: number, value: number ){
    /*
    USING old fashioned way of simple objects to mimic key-value mapping
    DONT USE: new Map(), it will cause performance problems
    
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
    kMap.set(k, value);*/
    let jstruct = this._map2[i];
    if (jstruct === undefined){
      jstruct = {};
      this._map2[i] = jstruct;
    }
    let kstruct = jstruct[j];
    if (kstruct === undefined){
      kstruct = {};
      jstruct[j] = kstruct;
    }
    kstruct[k] = value;
  }
}
