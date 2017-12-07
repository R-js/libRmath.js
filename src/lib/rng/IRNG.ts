import { INormal } from 'src/lib/normal';

export type MessageType = 'INIT';

export abstract class IRNG {

  private notify: Set<{ event: MessageType, handler: () => void }>;

  constructor(_seed: number) { 
    this.notify = new Set();
    this.emit = this.emit.bind(this);
    this.register = this.register.bind(this);
    this.unif_rand = this.unif_rand.bind(this);
    this.init = this.init.bind(this);
    this._setup(); 
    this.init(_seed);
  }
  
  public abstract _setup(): void;

  public init(_seed: number): void{
    this.emit('INIT');
  }

  public abstract set seed(_seed: number[]);
  
  public abstract unif_rand(): number ;
  public abstract get seed(): number[];
  // event stuff
  public register(event: MessageType, handler: () => void){
     this.notify.add({event, handler});
  }

  public emit(event: MessageType){
     this.notify.forEach( r => {
       if (r.event === event){
         r.handler();
       }
     });
  }
}
