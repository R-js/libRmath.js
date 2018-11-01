'use strict'
//http://stat.ethz.ch/R-manual/R-patched/library/stats/html/Normal.html
//https://en.wikipedia.org/wiki/Normal_distribution

import { Normal } from '../../src/lib/normal';
import { /*checkPrec6,*/ createComment } from '../test-helpers';
import { each, /*Rcycle,*/ flatten, multiplexer } from '../../src/lib/r-func';
import fixture from './fixture';

describe(`Normal distribution test`, () => {
    const dnormFixture = fixture.dnorm;
    const { dnorm } = Normal()
    describe('dnorm', () => {
        each(dnormFixture)((testCase, testCaseName) => {
            const { input, expected:_expected } = testCase;
            const _x = Array.from(flatten(input.x))
            const _mu = Array.from(flatten(input.mu))
            const _sigma = Array.from(flatten(input.sigma))
            const _asLog = Array.from(flatten(input.asLog))
            multiplexer(_x,_mu,_sigma,_asLog, _expected)((x,mu,sigma, aslog, expected)=>{
               const comment = createComment({x,mu,sigma, aslog});
               it(`${testCaseName}:${comment}`, () => {
                //   const { x, mu, sigma, asLog } = input;
                const result = dnorm(x, mu, sigma, aslog);
                console.log(result);
               // checkPrec6(expected, result);
            });
        });
    })
})
})
