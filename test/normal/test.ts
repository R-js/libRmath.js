
/* This is a conversion from libRmath.so to Typescript/Javascript
Copyright (C) 2018  Jacob K.F. Bogers  info@mail.jacob-bogers.com

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
'use strict'
import { Normal } from '../../src/lib/normal';
import { checkPrec6, createComment } from '../test-helpers';
import { each, map, c, Rcycle } from '../../src/lib/r-func';
import fixture from './fixture';

describe(`Normal distribution test`, () => {
    const { dnorm, qnorm, pnorm } = Normal()

    const dnormFixture = fixture.dnorm;
    describe('dnorm', () => {
        each(dnormFixture)((testCase, testCaseName) => {
            if (testCase['skip']) { return }
            const { input, expected: _expected } = testCase;
            let cnt = 0;
            Rcycle(({ x, mu, sd, l }, expcted) => {
                cnt++
                const comment = createComment({ x, mu, sd, l });
                it(`test:${cnt}\t→${comment}`,
                    function (this: unknown, { x, mu, sd, l }, expected) {
                        const result = dnorm(x, mu, sd, l);
                        checkPrec6(expected, result);
                    }.bind(null, { x, mu, sd, l }, expcted))
            })(input, _expected)
        });
    })
    const qnormFixture = fixture.qnorm;
    describe('qnorm', () => {
        each(qnormFixture)((testCase, testCaseName) => {
            const { input, expected: _expected } = testCase;
            let cnt = 0;
            Rcycle(({ p, mu, sd, lt, l }, expcted) => {
                cnt++;
                const comment = createComment({ p, mu, sd, lt, l });
                it(`test:${cnt}\t→${comment}`,
                 function (this: unknown, { x, mu, sd, l }, expected) {
                    const result = qnorm(p, mu, sd, lt, l);
                    checkPrec6(expected, result);
                }.bind(null, { p, mu, sd, lt, l }, expcted))
            })(input, _expected)
        });
    })
    const pnormFixture = fixture.pnorm;
    describe('pnorm', () => {
        each(pnormFixture)((testCase, testCaseName) => {
            const { input, expected } = testCase;
            let cnt = 0;
            Rcycle(({ q, mu, sd, lt, l,}, _expected ) => {
                cnt++;
                const comment = createComment({ q, mu, sd, lt, l });
                it(`test:${cnt}\t→${comment}`, 
                function(this:unknown,{q, mu, sd, lt, l}, expected) {
                    const result = pnorm(q, mu, sd, lt, l);
                    checkPrec6(expected, result);
                }.bind(null, {q,mu,sd, lt,l}, _expected))
            })(input, expected)
        });
    })
})

