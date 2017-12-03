'use strict';

function fixup(x: number) {
  const i2_32m1 = 2.328306437080797e-10; /* = 1/(2^32 - 1) */
  /* ensure 0 and 1 are never returned */
  if (x <= 0.0) return 0.5 * i2_32m1;
  if (1.0 - x <= 0.0) return 1.0 - 0.5 * i2_32m1;
  return x;
}


fixup.prototype.i2_32m1 = 2.328306437080797e-10;

export { fixup };
