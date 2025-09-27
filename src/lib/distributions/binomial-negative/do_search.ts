import { LoggerEnhanced, decorateWithLogger } from "@common/debug-frontend";
import VariableArgumentError from "@lib/errors/VariableArgumentError";
import pnbinom from "./pnbinom";
import { NumberW } from "@common/toms708/NumberW";

export default decorateWithLogger(function do_search(this: LoggerEnhanced, y: number, z: NumberW, p: number, n: number, pr: number, incr: number): number {
    this?.printer?.(VariableArgumentError, 'start: y:%d, z:%o, p:%d, n:%d, pr:%d, incr:%d', y, z, p, n, pr, incr);
    if (z.val >= p) {
        //* search to the left
        for (; ;) {
            if (
                y === 0 ||
                (z.val = pnbinom(
                    y - incr,
                    n,
                    pr,
                    true, ///log_p,
                    false
                )) < p
            ) {
                this?.printer?.(VariableArgumentError, 'exit1');
                return y;
            }
            y = Math.max(0, y - incr);
        } //while
    } else {
        // search to the right

        for (; ;) {
            y = y + incr;
            if (
                (z.val = pnbinom(
                    y,
                    n,
                    pr, //l._t.
                    true,
                    false
                )) >= p
            ) {
                this?.printer?.(VariableArgumentError, 'exit2');
                return y;
            }
        } //while
    } //if
});
