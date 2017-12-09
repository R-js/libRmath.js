 libR = require('./dist/lib/libR');
 let sd = new libR.rng.SuperDuper(0);
 bm = new libR.rng.normal.BoxMuller(sd);
 n = libR.normal(bm);

 jwt = require('jsonwebtoken')
 fs = require('fs');
 pubk = fs.readFileSync('ecdsa_public_key.pem', 'utf8');

 privk2 =
     `-----BEGIN EC PRIVATE KEY-----\nMHcCAQEEIN6uVN/NYrchd9W8Ody435MDhvl/EFES8dW7ccNPCwEAoAoGCCqGSM49\nAwEHoUQDQgAEhHoYrwNY/umWU0tmyZXnSHZOwwah6m3ddnLUmGdQRWHHYjD/ElDQ\n5Xho/cEHxecG6rmZsN6TS5GyetWwjVVZ+Q==\n-----END EC PRIVATE KEY-----\n`;

 for (let i = 0; i < privk2.length; i++) {
     if (privk2[i] !== privk[i]) {
         console.log(`diff at char:${i}`);
         console.log(privk2.substr(0, i));
         console.log(`##:${privk2.substr(i)}`);
         break;
     }
 }

 payload = {
     sub: "1234567890",
     name: "John Doe",
     admin: true
 };

 signed = jwt.sign(payload, privk2, {
     algorithm: 'ES256',
     expiresIn: '5s'
 });

 check = () => jwt.verify(signed, pubk, {
     // Never forget to make this explicit to prevent
     // signature stripping attacks.
     algorithms: ['ES256'],
 });