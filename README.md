# maybe-just-maybe
A Maybe monad specifically designed for use with Ramda

`maybe-just-maybe` conforms to the Monad algebra as described by 
The [Fantasy Land specification](https://github.com/fantasyland/fantasy-land).
It implements not only the 
[Monad specification](https://github.com/fantasyland/fantasy-land#monad) 
but also 
[Alt](https://github.com/fantasyland/fantasy-land#alt),
[Alternative](https://github.com/fantasyland/fantasy-land#alternative),
[Applicative](https://github.com/fantasyland/fantasy-land#applicative),
[Apply](https://github.com/fantasyland/fantasy-land#apply), 
[Chain](https://github.com/fantasyland/fantasy-land#chain), 
[Functor](https://github.com/fantasyland/fantasy-land#functor),
[Monoid](https://github.com/fantasyland/fantasy-land#monoid),
[Plus](https://github.com/fantasyland/fantasy-land#plus),
[Semigroup](https://github.com/fantasyland/fantasy-land#semigroup),
and [Setoid](https://github.com/fantasyland/fantasy-land#setoid).
The Maybe monad provides a container for a value that may or may not exist. The `Maybe.Just`
type is used for values that do exist, and the `Maybe.Nothing` type is used for values
that do not exist. Wrapping a value with `Maybe` allows you to perform functions using 
the `Maybe` interface that is designed to behave predictably despite the existence
without having to worry about whether the value for that instance exists yet.
If your `Maybe` instance is a `Nothing`, the function performed on that instance will
return another `Nothing` instance. If your `Maybe` instance is a `Just`, the function
performed on that instance will return another `Just` wrapping the result of 
evaluating that function.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [API](#api)

## Installation

This module is distributed via npm:

```
npm install --save maybe-just-maybe
```

or

```
yarn add maybe-just-maybe
```

## Usage

Since `maybe-just-maybe` is designed for use with Ramda, the following example shows a
simple example of how we could use this Maybe monad with Ramda.

```javascript
// doubleIt :: Number -> Number
const doubleIt = R.multiply(2);

// maybeNumber :: a -> Maybe Number
const maybeNumber = R.ifElse(
  R.is(Number),
  Maybe.of,
  Maybe.Nothing
);

// justDoubleIt :: Maybe Number -> Maybe Number
const justDoubleIt = Maybe.of(doubleIt).ap;

// safeDouble :: a -> Maybe Number
const safeDouble = R.compose(justDoubleIt, maybeNumber);

safeDouble(10) // evaluates as Just 20, a Just containing the result of doubling 10
safeDouble(null) // evaluates as Nothing, since safeNumber(null) is Nothing
safeDouble([ 1, 2 ]) // evaluates as Nothing when given an array
safeDouble('one hundred') // evaluates as Nothing when given a string
safeDouble(() => 99) // evaluates as Nothing when given a function

```

First we define the `doubleIt` function. Because it is built using `R.multiply` it is
fairly safe to call the function with any value already. Evaluating `doubleIt(4)` will
give a result of `8`, evaluating `doubleIt(undefined)` will give a result of `null`.
Same goes for `doubleIt('one million')`, `doubleIt([3, 4, 5])`, or `doubleIt({value: 99})`.
But it may be surprising to discover that evaluating `doubleIt(null)` results in a 
value of `0`.

Next we define `maybeNumber` as a point-free function that will wrap any
value we give it in a `Maybe`. If the specified argument is a number, `maybeNumber` will
return a `Just` containing that number. Otherwise `maybeNumber` will return a `Nothing`.
We can be confident that `maybeNumber` will always return a `Maybe`, and that `Maybe` will
only ever be a `Just` if the wrapped value is a number.

Next we define `justDoubleIt` as a function that wraps our `doubleIt` function in a `Maybe`
so that we can apply this `Maybe` instance to other `Maybe` instances by way of its 
`ap` method. Since our example is only interested
in applying this `Maybe` function, we have explicitly exposed only the `ap` method of
our `Maybe` from `justDoubleIt`. Whereas `doubleIt` expects its 
argument to be a number, `justDoubleIt` expects to be called with a `Maybe` instance, and
will never return a `Just` when called with any value that is not a `Maybe`.

We are now ready to define our `safeDouble` function as the composition of 
`justDoubleIt` being applied to the result of `maybeNumber`. This
composition works because `maybeNumber` always returns a `Maybe` and `justDoubleIt.ap` 
expects a Maybe.

Calling `safeDouble` with any argument will always return a `Maybe Number`. If it is 
called with a numeric argument then `safeDouble` will return a `Just` containing a 
number resulting from doubling the specified number. Otherwise it returns a `Nothing`. 
We can continue composing other more complex functions that consume `Maybe` instances 
with the understanding that the `Maybe` rules for handling `Just` values and `Nothing` 
values allow the applied functions to assume that they will only be applied when the 
`Maybe` instance is a `Just`.

##API

###Constructors

- **Just** `:: a -> Maybe a`

  creates a `Maybe` instance of type `Just` that contains the specified value
  
  *arguments:*
  
  - `value` (any) - the value to be wrapped in the `Maybe` instance
  
  *aliases:*

  - **Maybe.of** `:: Applicative Maybe`

  - **Maybe['fantasy-land/of']** `:: Applicative Maybe`

  *example:*
  ```javascript
  const a = Maybe.Just([1, 2, 3])

  const o = Maybe.of({ x: 'value' })

  const f = Maybe['fantasy-land/of']((x) => x + 1)
  ```

- **Nothing** `:: () -> Maybe a`

  creates a `Maybe` instance of type `Nothing` that contains no value
  
  *arguments:* none
  
  *aliases:*

  - **Maybe.empty** `:: Monoid Maybe`

  - **Maybe[fantasy-land/empty]** `:: Monoid Maybe`

  - **Maybe.zero** `:: Plus Maybe`

  - **Maybe['fantasy-land/zero']** `:: Plus Maybe`

  *example:*
  ```javascript
  // all of these produce the same result

  const v = Maybe.Nothing()

  const s = Maybe.empty('this value or any value will be discarded by Nothing')

  const f = Maybe.zero(42)

  const f = Maybe['fantasy-land/zero'](null)
  ```

- **asyncOf** `:: Promise a -> Maybe a`

  creates a `Maybe` instance that transforms from its initial `Nothing` type to a `Just` type
  that contains the value obtained from the specified `Promise` when it resolves
  
  *arguments:*
  - `p` (Promise) - the Promise that will resolve the value for this `Maybe` instance
  
  *example:*
  ```javascript
  const promise = Promise.resolve('response received')
  const a = Maybe.asyncOf(promise)

  a.isNothing() // true before the promise resolves
                // false after the promise resolves
  a.valueOr('no value') // 'no value' before the promise resolves
                        // 'response received' after the promise resolves
  ```

###Instance methods

- **alt** `:: Alt Maybe => Maybe a ~> Maybe a -> Maybe a`
  
  returns the first available `Just`, or returns `Nothing` if neither `Maybe` is a `Just`.

  *arguments:*
  - `other` (Maybe) - the `Maybe` that will be returned if the `Maybe` instance that `alt` was
  called on is a `Nothing`

  *alias:*
  - **['fantasy-land/alt']**
    
  *example:*
  ```javascript
  const a = Maybe.of(1)
  const b = Maybe.of(2)
  const n = Maybe.Nothing()
  
  const w = a.alt(b) // Just 1
  const x = a.alt(n) // Just 1
  const y = n.alt(b) // Just 2
  const z = Maybe.Nothing().alt(n) // Nothing
  ```

- **ap** `:: Apply Maybe => Maybe a ~> Maybe (a -> b) -> Maybe b`
  
  applies a `Maybe` of a function to a `Maybe` of a value in order to produce a
  `Maybe` containing the result of that evaluation.

  *arguments:*
  - `other` (Maybe) - the `Maybe` that contains the complement for the `Maybe` instance that `ap`
  was called on

  *example:*
  ```javascript
  const a = Maybe.of(3)
  const f = Maybe.of(R.multiply(2))
  const n = Maybe.Nothing()
  
  const af = a.ap(f) // Just 6
  const fa = f.ap(a) // Just 6
  const fn = f.ap(n) // Nothing
  const na = n.ap(a) // Nothing
  ```

- **chain** `:: Chain Maybe => Maybe a ~> (a -> Maybe b) -> Maybe b`

  applies a function to the value inside a `Maybe` in order to return the `Maybe` produced
  by that evaluation. If the function does not return a `Maybe` value then chain will return a `Nothing`.
  
  *arguments:*
  - `f` (Function) - the function that will be applied to the value in the `Maybe` instance that
  `chain` was called on
  
  *alias:*
  
  - **[fantasy-land/chain]**

  *example:*
  ```javascript
  const a = Maybe.of([
    { value: 'cat', type: 'pet', active: true },
    { value: 'flower', type: 'pot', active: false },
    { value: 'dog', type: 'pet', active: true },
    { value: 'bird', type: 'pet', active: false },
    { value: 'cherry', type: 'pit', active: true }
  ])
  
  const getActives = R.filter(R.propEq('active', true))
  const getPets = R.filter(R.propEq('type', 'pet'))
  const findCs = R.compose(R.test(/^c/), R.prop('value'))
  const getCs = R.filter(findCs)

  const isActive = R.compose(Maybe.of, getActives)
  const isPet = R.compose(Maybe.of, getPets)
  const startsWithC = R.compose(Maybe.of, getCs)

  const cs = a.chain(startsWithC)
  // Just [ { value: 'cat'... }, { value: 'cherry'... } ]
  
  const pets = a.chain(isPet)
  // Just [ { value: 'cat'... }, { value: 'dog'... }, { value: 'bird'... } ]
  
  const actives = a.chain(isActive)
  // Just [ { value: 'cat'... }, { value: 'dog'... }, { value: 'cherry'... } ]
  
  const activeCPets = a.chain(startsWithC).chain(isPet).chain(isActive)
  // Just [ { value: 'cat', type: 'pet', active: true } ]
  
  const nonstarter = Maybe.Nothing().chain(startsWithC).chain(isPet).chain(isActive)
  // Nothing

  ```

- **concat** `:: Semigroup a => Maybe a ~> Maybe a -> Maybe a`
  
  allows the values of matching types contained by 2 `Maybe` instances to be concatenated using 
  Ramda's `R.concat`. If either instance is a `Nothing` then concat will result in a `Maybe` equal to
  the non-`Nothing` instance. If both instances are `Nothing`, then concat will result in a `Nothing`.
  If the values contained by the 2 `Maybe` instances are not of the same type, then concat will
  result in a `Nothing`.

  *arguments:*
  - `other` (Maybe) - the `Maybe` that contains the value that will be concatenated with the value of
  the `Maybe` that `concat` was called on
  
  *alias:* 
   
   - **[fantasy-land/concat]**
   
  *example:*
  ```javascript
  const a = Maybe.of([1, 3, 5])
  const b = Maybe.of([6, 8])
  const c = Maybe.of([9])
  
  a.concat(b) // Just [1, 3, 5, 6, 8]
  a.concat(b).concat(c) // Just [1, 3, 5, 6, 8, 9]
  a.concat(b.concat(c)) // Just [1, 3, 5, 6, 8, 9]
  a.concat(Maybe.Nothing()).concat(c) // Just [1, 3, 5, 9]
  ```

- **either** `:: Maybe a ~> ((() -> b), (a -> b)) -> b`
  
  accepts a left function and a right function and evaluates one of those functions based on whether
  the `Maybe` instance is a `Nothing` or a `Just`. If the `Maybe` is a `Nothing` then the result of 
  evaluating the left function is returned. If the `Maybe` is a `Just` then the result of evaluating
  the right function with the `Maybe`'s value is returned.

  *arguments:*
  - `left` (Function) - the function to evaluate if the `Maybe` instance that `either` was called on is
  a `Nothing`
  - `right` (Function) - the function to evaluate using the value in the `Maybe` instance that `either`
  was called on if that `Maybe` is a `Just`

  *example:*
  ```javascript
  const j = Maybe.of('the quick brown fox')
  const n = Maybe.Nothing()

  const left = R.always([])
  const right = R.split(' ')

  j.either(left, right) // ['the', 'quick', 'brown', 'fox']
  n.either(left, right) // []
  ```

- **empty** `:: Maybe a ~> () -> Maybe a`

  returns a `Maybe` instance of type `Nothing` regardless of the type of the original `Maybe`

  *arguments:* none

  *example:*
  ```javascript
  const j = Maybe.of('any value')
  const n = Maybe.Nothing()

  j.empty() // Nothing
  n.empty() // Nothing
  ```

- **equals** `:: Setoid a => Maybe a ~> Maybe a -> Boolean`

  tests the equality of the values contained by 2 `Maybe` instances

  *arguments:*
  - `other` (Maybe) - the `Maybe` containing the value to be compared to the value in the `Maybe` 
  instance that `equals` was called on

  *alias:* 
  
  - **[fantasy-land.equals]**
  
  *example:*
  ```javascript
  const a = Maybe.of(42)
  const b = Maybe.of(6).map(x => x * 7)
  const c = Maybe.Nothing()

  a.equals(b) // true
  a.equals(c) // false
  c.equals(b) // false
  c.equals(Maybe.Nothing()) // true
  ```

- **is** `:: Maybe a ~> b -> Boolean`

  tests the type of the value contained by a `Maybe` using Ramda's `R.is`. One notable difference
  from `R.is` is that `Maybe.of(x).is(Object)` will return false if x is an Array, a Function, or
  a Date.
  
  *arguments:*
  - `t` (Function) - the constructor function to use to test the type of the value contained by
  the `Maybe` that `is` was called on
  
  *example:*
  ```javascript
  Maybe.of('a string').is(String) // true
  Maybe.of(13).is(Number) // true
  Maybe.of(true).is(Number) // false
  Maybe.of({ a: 1 }).is(Object) // true
  Maybe.of([ 1, 2, 3 ]).is(Array) // true
  Maybe.of(x => x).is(Function) // true
  Maybe.of(undefined).is(Function) // false
  Maybe.Nothing().is(Object) // false
  ```

- **isJust** `:: Maybe a -> Boolean`

  tests whether a `Maybe` is of type `Just`
  
  *arguments:* none
  
  *example:*
  ```javascript
  Maybe.of(99).isJust() // true
  Maybe.Nothing().isJust() // false
  ```

- **isNothing** `:: Maybe a -> Boolean`

  tests whether a `Maybe` is of type `Nothing`
  
  *arguments:* none
  
  *example:*
  ```javascript
  Maybe.of(99).isNothing() // false
  Maybe.Nothing().isNothing() // true
  ```

- **map** `:: Functor Maybe => Maybe a ~> (a -> b) -> Maybe b`

  transforms the items wrapped in the `Maybe` instance by evaluating the map function for each item
  and wrapping the resulting items in another `Maybe` instance

  *arguments:*
  - `f` (Function) - the map function to be applied to the items contained by the `Maybe` instance
  that `map` was called on
  
  *alias:* 
  - **[fantasy-land/map]**

  *example:*
  ```javascript
  const a = Maybe.of([ 1, 2, 3, 4 ])
  const b = Maybe.of({
    a: 'Thanks',
    b: 'for', 
    c: 'all', 
    d: 'the', 
    e: 'fish' 
  })
  const c = Maybe.of(99)
  const n = Maybe.Nothing()
    
  a.map(R.multiply(3)) // Just [ 3, 6, 9, 12 ]
  b.map(R.toUpper)  // Just { 
                    //   a: 'THANKS', 
                    //   b: 'FOR', 
                    //   c: 'ALL', 
                    //   d: 'THE', 
                    //   e: 'FISH' 
                    // }
  c.map(x => x % 9 === 0) // Just true
  n.map(toUpper)  // Nothing
  ```

- **of** `:: Maybe a ~> b -> Maybe b`

  creates a new `Maybe` instance of type `Just` that contains the specified value

  *arguments:*
  - `value` (any) - the value to be wrapped in the `Maybe` instance
  
  *alias:*
  
  - **[fantasy-land/of]**

- **toJust** `:: Maybe a ~> b -> Maybe b`

  returns a `Maybe` instance of type `Just` containing the specified value regardless of the type of 
  the original `Maybe`
  
  *arguments:*
  - `value` (any) - the value to be wrapped in the `Maybe` instance
  
  *example:*
  ```javascript
  const j = Maybe.of('any value')
  const n = Maybe.Nothing()

  j.toJust('another value') // Just "another value"
  n.toJust('new value') // Just "new value"
  ```

- **toString** = `:: Maybe a ~> () -> String`

  returns a string representation of the `Maybe` instance
  
  *arguments:* none
  
  *example:*
  ```javascript
  const a = Maybe.Just([ 1, 2 ])
  const b = Maybe.Just({ a: 1 })
  const n = Maybe.Nothing()

  a.toString() // 'Just [1,2]'
  b.toString() // 'Just {"a":1}'
  c.toString() // 'Nothing'
  
  ```

- **valueOr** `:: Maybe a ~> a -> a`

  either returns the value contained by the `Maybe` instance or returns the supplied value in the
  case where the `Maybe` instance is of type `Nothing`
  
  *arguments:*
  - `defaultValue` (any) - the value that will be returned if the `Maybe` instance that `valueOr` was
  called on is a `Nothing`
  
  *example:*
  ```javascript
  const j = Maybe.of('selected option')
  const n = Maybe.Nothing()
  const defaultValue = 'default option'
  
  j.valueOr(defaultValue) // 'selected option'
  n.valueOr(defaultValue) // 'default option'

  ```

- **zero** `:: Plus Maybe => Maybe a ~> () -> Maybe a`

  returns a `Maybe` instance of type `Nothing` regardless of the type of the original `Maybe`
  
  *arguments:* none
  
  *alias:* 
  - **[fantasy-land/zero]**

  *example:*
  ```javascript
  Maybe.of(['values']).zero() // Nothing
  ```


