//helper
import '$jest-extension';
import { loadData } from '$test-helpers/load';
import { resolve } from 'path';

jest.mock('@common/logger', () => {
    // Require the original module to not be mocked...
    const originalModule = jest.requireActual('@common/logger');
    const { ML_ERROR, ML_ERR_return_NAN } = originalModule;
    let array: unknown[];
    function pr(...args: unknown[]): void {
        array.push([...args]);
    }

    return {
        __esModule: true, // Use it when dealing with esModules
        ...originalModule,
        ML_ERROR: jest.fn((x: unknown, s: unknown) => ML_ERROR(x, s, pr)),
        ML_ERR_return_NAN: jest.fn(() => ML_ERR_return_NAN(pr)),
        setDestination(arr: unknown[]) {
            array = arr;
        },
        getDestination() {
            return array;
        }
    };
});

const cl = require('@common/logger');
//app
import { qbinom } from '..';

describe('qbinom', function () {
    it('ranges p ∊ [0, 1, step 0.01] size=10, prob=0.5', async () => {
        const [x, y] = await loadData(resolve(__dirname, 'fixture-generation', 'qbinom1.R'), /\s+/, 1, 2);
        const actual = x.map(_x => qbinom(_x, 10, 0.5));
        expect(actual).toEqualFloatingPointBinary(y)
    });
    it('p = NaN, size=NaN, prob=0.01', () => {
         const actual = qbinom(NaN, NaN, 0.01);
         expect(actual).toBeNaN();
    });
    it('p = Infinity, size=10, prob=0.5', () => {
        const dest: string[] = [];
        cl.setDestination(dest);
        const actual = qbinom(Infinity, 10, 0.5);
        expect(actual).toBeNaN();
        expect(dest.length).toBe(1);
    });
    it('p = 0.5, size=Infinity, prob=0.5', () => {
        const dest: string[] = [];
        cl.setDestination(dest);
        const actual = qbinom(0.5, Infinity, 0.5);
        expect(actual).toBeNaN();
        expect(dest.length).toBe(1);
    });
    it('p = 0.5, size=5.2 (non integer), prob=0.5', () => {
        const dest: string[] = [];
        cl.setDestination(dest);
        const actual = qbinom(0.5, 5.2, 0.5);
        expect(actual).toBeNaN();
        expect(dest.length).toBe(1);
    });
    it('p = 0.5, size=-5 (<0), prob=0.5', () => {
        const dest: string[] = [];
        cl.setDestination(dest);
        const actual = qbinom(0.5, -5, 0.5);
        expect(actual).toBeNaN();
        expect(dest.length).toBe(1);
    });
    it('p = 0.5, size=5 , prob=0', () => {
        const actual = qbinom(0.5, 5, 0);
        expect(actual).toBe(0);
    });
    it('p = 0.5, size=5 , prob=1', () => {
        const actual = qbinom(0.5, 5, 1);
        expect(actual).toBe(5);
    });
    it('p=-2.302, size=50 , prob=0.5, tail=TRUE, logp=TRUE', () => {
        const z0 = qbinom(-2.302, 50, 0.5, true, true);
        expect(z0).toBe(20);
    });
    it('p=(1-EPSILON/2), size=50 , prob=0.3', () => {
        const z0 = qbinom(1-Number.EPSILON/2, 50, 0.3);
        console.log(z0);
        expect(z0).toBe(50);
    });
    it('p=0.99, size=50 , prob=0.99', () => {
        const z0 = qbinom(0.9999999, 50, 0.99);
        expect(z0).toBe(50);
    });
    it('p=0.99, size=1e6 , prob=0.99', () => {
        const z0 = qbinom(0.9999999, 1e6, 0.99);
        expect(z0).toBe(990513);
    });
        
       
    /* it('x = 5, size=Infinity, prob=0.01', () => {
         const dest: string[] = [];
         cl.setDestination(dest);
         const actual = pbinom(5, Infinity, 0.01);
         expect(actual).toBeNaN();
         expect(dest.length).toBe(1);
         console.log(dest);
     });
     /* it('x=0, size=12, prob=0, asLog=true|false', () => {
          const z0 = dbinom(0, 12, 0, true);
          expect(z0).toBe(0); //log(1) //
          const z1 = dbinom(0, 12, 0);
          expect(z1).toBe(1);
      });
      it('x=4 (x!=0 || x!=12), size=12, prob=0, asLog=true|false', () => {
          const z0 = dbinom(4, 12, 0, true);
          expect(z0).toBe(-Infinity); //log(0) //
          const z1 = dbinom(4, 12, 0);
          expect(z1).toBe(0);
      });
      it('x=12, size=12, prob=0, asLog=true|false', () => {
          const z0 = dbinom(12, 12, 1, true); // 100%, you always score "head", never "tail"
          expect(z0).toBe(0);
          const z1 = dbinom(12, 12, 1);
          expect(z1).toBe(1);
      });
      it('x=8, size=12, prob=0, asLog=true|false', () => {
          const z0 = dbinom(8, 12, 1, true); // 100%, you always score "head", never "tail"
          expect(z0).toBe(-Infinity);
          const z1 = dbinom(8, 12, 1);
          expect(z1).toBe(0);
      });
      it('x=0, size=0, prob=0.2, asLog=true|false', () => {
          const z0 = dbinom(0, 0, 0.2, true); // 100%, you always score "head", never "tail"
          expect(z0).toBe(0);
          const z1 = dbinom(0, 0, 0.2);
          expect(z1).toBe(1);
      });
      it('x=0, size=100, prob=0.99, asLog=true', () => {
          const z0 = dbinom(0, 100, 0.99, true); // 100%, you always score "head", never "tail"
          expect(z0).toEqualFloatingPointBinary(-460.517018598809);
      });
      it('x=100, size=100, prob=0.99, asLog=true', () => {
          const z0 = dbinom(100, 100, 0.99, true); // 100%, you always score "head", never "tail"
          expect(z0).toEqualFloatingPointBinary(-1.0050335853501451);
      });
      it('x=-1|x=101, size=100, prob=0.99', () => {
          const z0 = dbinom(-1, 100, 0.99); // 100%, you always score "head", never "tail"
          expect(z0).toBe(0);
          const z2 = dbinom(101, 100, 0.99); // 100%, you always score "head", never "tail"
          expect(z2).toBe(0);
      });
      it('x=4, size=100, prob=3 (>1)', () => {
          const dest: string[] = [];
          cl.setDestination(dest);
          const z0 = dbinom(4, 100, 3); // 100%, you always score "head", never "tail"
          expect(z0).toBeNaN();
          expect(dest.length).toBe(1);
          console.log(dest);
      });
      it('x=4, size=NaN, prob=0.5', () => {
          const z0 = dbinom(4, NaN, 0.5); // 100%, you always score "head", never "tail"
          expect(z0).toBeNaN();
      });
  
    */
});