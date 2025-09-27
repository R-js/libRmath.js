import { LoggerEnhanced, decorateWithLogger } from "@common/debug-frontend";
import { NumberW } from "@common/toms708/NumberW";
import VariableArgumentError from "@lib/errors/VariableArgumentError";
import pbinom from "./pbinom";

export default decorateWithLogger(function do_search(this: LoggerEnhanced, y: number, z: NumberW, p: number, n: number, pr: number, incr: number): number {
    if (z.val >= p) {
        /* search to the left */

        this?.printer?.(VariableArgumentError, 'new z=%o >= p = %d  --> search to left (y--) ..', z, p);

        for (; ;) {
            let newz: number;
            if (y === 0 || (newz = pbinom(y - incr, n, pr, /*l._t.*/ true, /*logP*/ false)) < p) return y;
            y = Math.max(0, y - incr);
            z.val = newz;
        }
    } else {
        /* search to the right */

        this?.printer?.(VariableArgumentError, 'new z=%d < p = %d  --> search to right (y++) ..', z.val, p);

        for (; ;) {
            y = Math.min(y + incr, n);
            if (y === n || (z.val = pbinom(y, n, pr, /*l._t.*/ true, /*logP*/ false)) >= p) return y;
        }
    }
});