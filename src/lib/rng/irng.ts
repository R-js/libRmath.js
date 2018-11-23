
import { map, seq } from '../r-func';
import { IRNGType } from './irng-type';

export type MessageType = 'INIT';

export abstract class IRNG {
  protected _name: string;
  protected _kind: IRNGType;

  private notify: Set<{ event: MessageType, handler: () => void }>;

  constructor(_seed: number) {
    this.notify = new Set();
    this.emit = this.emit.bind(this);
    this.register = this.register.bind(this);
    this.unif_rand = this.unif_rand.bind(this);
    this.internal_unif_rand = this.internal_unif_rand.bind(this);
    this.init = this.init.bind(this);
    this._setup();
    this.init(_seed);
  }

  public get name() {
    return this._name;
  }

  public get kind() {
    return this._kind;
  }

  public abstract _setup(): void;

  public init(_seed: number): void {
    this.emit('INIT');
  }

  public abstract set seed(_seed: number[]);

  public unif_rand(): number;
  public unif_rand(n: 0 | 1): number;
  public unif_rand(n: number): number | number[];
  public unif_rand(n: number = 1): number | number[] {
    n = (!n || n < 0) ? 1 : n;
    return map(seq()()(n))(() => this.internal_unif_rand());
  }

  protected abstract internal_unif_rand(): number;

  public abstract get seed(): number[];
  // event stuff
  public register(event: MessageType, handler: () => void) {
    this.notify.add({ event, handler });
  }

  public emit(event: MessageType) {
    this.notify.forEach(r => {
      if (r.event === event) {
        r.handler();
      }
    });
  }
}
