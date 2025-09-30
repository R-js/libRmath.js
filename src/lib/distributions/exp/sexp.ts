import type { IRNG } from '@rng/irng';

const q = new Float64Array([
  0.6931471805599453,
  0.9333736875190459,
  0.9888777961838675,
  0.9984959252914960,
  0.9998292811061389,
  0.9999833164100727,
  0.9999985691438767,
  0.9999998906925558,
  0.9999999924734159,
  0.9999999995283275,
  0.9999999999728814,
  0.9999999999985598,
  0.9999999999999289,
  0.9999999999999968,
  0.9999999999999999,
  1.0000000000000000
]);

export function exp_rand(rng: IRNG): number {

  let d_a = 0.;
  let d_u = rng.random();    // precaution if u = 0 is ever returned
  while (d_u <= 0 || d_u >= 1) d_u = rng.random();
  for (; ;) {
    d_u += d_u;
    if (d_u > 1)
      break;
    d_a += q[0];
  }
  d_u -= 1;

  if (d_u <= q[0])
    return d_a + d_u;

  let i_i = 0;
  let ustar = rng.random();
  let umin = ustar;
  do {
    ustar = rng.random();
    if (umin > ustar)
      umin = ustar;
    i_i++;
  } while (d_u > q[i_i]);
  return d_a + umin * q[0];
}

