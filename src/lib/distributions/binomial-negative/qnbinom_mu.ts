import qnbinom from "./qnbinom";

export default function qnbinom_mu(p: number, size: number, mu: number, lower_tail: boolean, log_p: boolean): number {
    return qnbinom(p, size, /* prob = */ size / (size + mu), lower_tail, log_p);
}
