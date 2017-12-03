

export abstract class IRNG {
 
  constructor(_seed: number) { this._setup(); this.init(_seed); }
  
  public abstract _setup(): void;
  public abstract init(_seed: number): void;
  public abstract set seed(_seed: number[]);
  
  public abstract unif_rand(): number ;
  public abstract get seed(): number[];
}
