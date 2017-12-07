import { IRNG } from '../';

export abstract class IRNGNormal {
  protected rng: IRNG;
  constructor(_rng: IRNG) {
    this.rng = _rng;
    this.unif_rand = this.unif_rand.bind(this);
    this.norm_rand = this.norm_rand.bind(this);
  }

  public abstract norm_rand(): number;
  public unif_rand() {
    return this.rng.unif_rand();
  }
}
