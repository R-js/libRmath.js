Jest api reference:

Globals

# afterAll(fn, timeout)
-  runs after all the test in the file have been completed, (like unmounting db or something)

# afterEach(fn, timeout)
-  

# beforeAll(fn, timeout)

Jest has some freaky shit when it comes to excution of fucntions

function exampleYield(cb) {
    // do some stuff
    setTimeout(() => cb('there was an error'), 2000);
}

// use of generator yielding a function when called using a callback (err, ...res[]) signature
beforeAll(function* () {
    yield exampleYield;
    const value = yield { hello: 'world' }; // weird, this will not work, because the value from the iterator is not satisfy  value.constructor === Object

    yield Promise.resolve({ hello: 'world' }); // this will work

    console.log(JSON.stringify(value));
    //console.log('heheh');
    //yield 3;
});


# beforeEach(fn, timeout)

# describe

# describe.each(table)(name, fn, timeout)
  table is an array of arguments passed to name, fn, timeout
example:
describe.each([
  [1, 1, 2],
  [1, 2, 3],
  [2, 1, 3],
])('.add(%i, %i)', (a, b, expected) => {
  test(`returns ${expected}`, () => {
    expect(a + b).toBe(expected);
  });

  test(`returned value not be greater than ${expected}`, () => {
    expect(a + b).not.toBeGreaterThan(expected);
  });

  test(`returned value not be less than ${expected}`, () => {
    expect(a + b).not.toBeLessThan(expected);
  });
});

# describe.only(name, fn)
only run this describe block skip the rest

# describe.only.each(table)(name, fn)

same as describe.only, but using a data guided table

# describe.skip(name, fn)

# describe.skip.each(table)(name, fn)

# test(name, fn, timeout) (alias  it(name, fn, timeout))

fn can be have done as argument
and done called with done (err) or done()

# test.concurrent(name, fn, timeout)

# test.concurrent.each(table)(name, fn, timeout)

fn (gets the rows of table as arguments to the function)


# test.concurrent.each`table`(name, fn, timeout)


# test.concurrent.each(table)(name, fn, timeout)

# test.concurrent.only.each(table)(name, fn)

# test.concurrent.skip.each(table)(name, fn)

# test.each(table)(name, fn, timeout)

# test.each`table`(name, fn, timeout)

# test.only(name, fn, timeout)

# test.only.each(table)(name, fn)


# test.skip(name, fn)

# test.skip.each(table)(name, fn)

# test.todo(name)






