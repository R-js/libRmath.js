'use strict'
//http://stat.ethz.ch/R-manual/R-patched/library/stats/html/Normal.html
//https://en.wikipedia.org/wiki/Normal_distribution

import { Normal } from '../../src/lib/normal';
import { checkPrec6, createComment } from '../test-helpers';
import { each, c, Rcycle } from '../../src/lib/r-func';
import fixture from './fixture';

describe(`Normal distribution test`, () => {
    const dnormFixture = fixture.dnorm;
    const { dnorm } = Normal()
    describe('dnorm', () => {
        each(dnormFixture)((testCase, testCaseName) => {
            const { input, expected: _expected } = testCase;
            const _x = c(input.x)
            const _mu = c(input.mu)
            const _sigma = c(input.sigma)
            const _asLog = c(input.asLog)
            let cnt = 0;
            Rcycle((x, mu,sigma, aslog, expected)=>{
                cnt++;
                const comment = createComment({ x, mu, sigma, aslog });
                it(`test:${cnt}\t${comment}`, () => {
                    //   const { x, mu, sigma, asLog } = input;
                    const result = dnorm(x, mu, sigma, aslog);
                    //console.log(result);
                    checkPrec6(expected, result);
                })
            })(_x,_mu, _sigma, _asLog, _expected) 
        });
    })
})

