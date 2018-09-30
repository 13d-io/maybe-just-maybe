const test = require('tape')
const sinon = require('sinon')
const R = require('ramda')

const {
  bindFunc,
  fantasyLand,
  isArray,
  isObject,
  isFunction,
  isString,
  isSameType,
  unit
} = require('./helpers')

const Maybe = require('../core/Maybe')

// const { toString }
const { alt, altU, ap, apU, chain, chainU, concat, concatU, either, eitherU, equals, equalsU,
  is, isU, isJust, isNothing, map, mapU, valueOr } = Maybe

test('Maybe', t => {
  const m = Maybe(0)

  t.ok(isFunction(Maybe), 'is a function')
  t.ok(isObject(m), 'returns an object')

  t.equals(Maybe.Just(2).constructor, Maybe, 'provides TypeRep on constructor for Just')
  t.equals(Maybe.Nothing().constructor, Maybe, 'provides TypeRep on constructor for Nothing')

  t.ok(isFunction(Maybe.of), 'provides an of function')
  t.ok(isFunction(Maybe.zero), 'provides a zero function')
  t.ok(isFunction(Maybe.Nothing), 'provides a Nothing constructor')
  t.ok(isFunction(Maybe.Just), 'provides a Just constructor')
  t.ok(isFunction(Maybe.type), 'provides a type function')
  t.ok(isString(Maybe['@@type']), 'provides a @@type string')

  t.ok(isFunction(Maybe.alt), 'provides an alt function')
  t.ok(isFunction(Maybe.altU), 'provides an altU function')
  t.ok(isFunction(Maybe.ap), 'provides an ap function')
  t.ok(isFunction(Maybe.apU), 'provides an apU function')
  t.ok(isFunction(Maybe.chain), 'provides a chain function')
  t.ok(isFunction(Maybe.chainU), 'provides a chainU function')
  t.ok(isFunction(Maybe.concat), 'provides a concat function')
  t.ok(isFunction(Maybe.concatU), 'provides a concatU function')
  t.ok(isFunction(Maybe.either), 'provides an either function')
  t.ok(isFunction(Maybe.eitherU), 'provides an eitherU function')
  t.ok(isFunction(Maybe.equals), 'provides an equals function')
  t.ok(isFunction(Maybe.is), 'provides an is function')
  t.ok(isFunction(Maybe.isJust), 'provides an isJust function')
  t.ok(isFunction(Maybe.isNothing), 'provides an isNothing function')
  t.ok(isFunction(Maybe.map), 'provides a map function')
  t.ok(isFunction(Maybe.mapU), 'provides a mapU function')
  t.ok(isFunction(Maybe.toString), 'provides a toString function')
  t.ok(isFunction(Maybe.valueOr), 'provides a valueOr function')

  const err = /Invalid Maybe constructor/
  t.throws(Maybe, err, 'throws with no parameters')

  t.end()
})

test('Maybe properties', t => {
  const value = 0
  const a = Maybe(value, false)
  const b = Maybe.Nothing()

  t.equal(a.value, value, 'value property for justs')
  t.equal(a.nothing, false, 'nothing property for justs')
  t.equal(b.value, undefined, 'value property for nothings')
  t.equal(b.nothing, true, 'nothing property for nothings')
  t.equal(a.value, a(), 'value is returned by instance function')
  t.equal(b(), undefined, 'undefined is returned by nothing instance function')

  t.end()
})

test('Maybe fantasy-land api', t => {
  const n = Maybe.Nothing()
  const j = Maybe.Just('')

  t.ok(isFunction(Maybe[fantasyLand.zero]), 'provides zero function on constructor')
  t.ok(isFunction(Maybe[fantasyLand.of]), 'provides of function on constructor')

  t.ok(isFunction(n[fantasyLand.zero]), 'provides zero method on Nothing instance')
  t.ok(isFunction(n[fantasyLand.of]), 'provides of method on Nothing instance')
  t.ok(isFunction(n[fantasyLand.equals]), 'provides equals method on Nothing instance')
  t.ok(isFunction(n[fantasyLand.alt]), 'provides alt method on Nothing instance')
  t.ok(isFunction(n[fantasyLand.concat]), 'provides concat method on Nothing instance')
  t.ok(isFunction(n[fantasyLand.map]), 'provides map method on Nothing instance')
  t.ok(isFunction(n[fantasyLand.chain]), 'provides chain method on Nothing instance')

  t.ok(isFunction(j[fantasyLand.zero]), 'provides zero method on Just instance')
  t.ok(isFunction(j[fantasyLand.of]), 'provides of method on Just instance')
  t.ok(isFunction(j[fantasyLand.equals]), 'provides equals method on Just instance')
  t.ok(isFunction(j[fantasyLand.alt]), 'provides alt method on Just instance')
  t.ok(isFunction(j[fantasyLand.concat]), 'provides concat method on Just instance')
  t.ok(isFunction(j[fantasyLand.map]), 'provides map method on Just instance')
  t.ok(isFunction(j[fantasyLand.chain]), 'provides chain method on Just instance')

  t.end()
})

test('Maybe @@implements', t => {
  const f = Maybe['@@implements']

  t.equal(f('alt'), true, 'implements alt func')
  t.equal(f('ap'), true, 'implements ap func')
  t.equal(f('chain'), true, 'implements chain func')
  t.equal(f('concat'), true, 'implements concat func')
  t.equal(f('equals'), true, 'implements equals func')
  t.equal(f('map'), true, 'implements map func')
  t.equal(f('of'), true, 'implements of func')
  t.equal(f('zero'), true, 'implements zero func')

  t.end()
})

test('Maybe @@type', t => {
  const { Just, Nothing } = Maybe

  t.equal(Just(0)['@@type'], Maybe['@@type'], 'stand-alone and instance versions are the same for Just')
  t.equal(Nothing(0)['@@type'], Maybe['@@type'], 'stand-alone and instance versions are the same for Nothing')

  t.equal(Just(0)['@@type'], '13d-io/Maybe', 'type returns 13d-io/Maybe for Just')
  t.equal(Nothing()['@@type'], '13d-io/Maybe', 'type returns 13d-io/Maybe for Nothing')

  t.end()
})

test('Maybe constructor test', t => {

  const either = Maybe.test(Maybe.Nothing().toString(), Maybe.of(13).toString)
  const a = { value: 42, nothing: false }
  const b = Maybe.Just(undefined)

  t.equal(either(a), 'Nothing', 'Testing a fake maybe returns the left')
  t.equal(either(b), 'Just 13', 'Testing an actual Maybe returns the right')

  t.end()
})

test('Maybe stays frozen', t => {
  const a = Maybe.of(1)
  a.value = 3
  t.equal(a.valueOr(999), 1, 'value is frozen in the Maybe')
  t.end()
})

test('Maybe undefined is not Nothing', t => {
  const j = Maybe.of(undefined)
  const n = Maybe.Nothing()
  t.equal(j.equals(n), false, 'Maybe undefined is not equal to nothing')
  t.equal(n.equals(j), false, 'Nothing is not equal to Maybe undefined')
  t.equal(j.isNothing(), false, 'Maybe undefined is not nothing')

  t.end()
})

test('Maybe alt errors', t => {
  const m = { type: () => 'Maybe...Not' }

  const altJust = x => Maybe.of(0).alt(x)

  t.equal(altJust(undefined).isNothing(), true, 'nothing when passed an undefined with Just')
  t.equal(altJust(null).isNothing(), true, 'nothing when passed a null with Just')
  t.equal(altJust(0).isNothing(), true, 'nothing when passed a falsey number with Just')
  t.equal(altJust(1).isNothing(), true, 'nothing when passed a truthy number with Just')
  t.equal(altJust('').isNothing(), true, 'nothing when passed a falsey string with Just')
  t.equal(altJust('string').isNothing(), true, 'nothing when passed a truthy string with Just')
  t.equal(altJust(false).isNothing(), true, 'nothing when passed false with Just')
  t.equal(altJust(true).isNothing(), true, 'nothing when passed true with Just')
  t.equal(altJust([]).isNothing(), true, 'nothing when passed an array with Just')
  t.equal(altJust({}).isNothing(), true, 'nothing when passed an object with Just')
  t.equal(altJust(m).isNothing(), true, 'nothing when container types differ on Just')

  const altNothing = x => Maybe.Nothing().alt(x)

  t.equal(altNothing(undefined).isNothing(), true, 'nothing when passed an undefined with Nothing')
  t.equal(altNothing(null).isNothing(), true, 'nothing when passed a null with Nothing')
  t.equal(altNothing(0).isNothing(), true, 'nothing when passed a falsey number with Nothing')
  t.equal(altNothing(1).isNothing(), true, 'nothing when passed a truthy number with Nothing')
  t.equal(altNothing('').isNothing(), true, 'nothing when passed a falsey string with Nothing')
  t.equal(altNothing('string').isNothing(), true, 'nothing when passed a truthy string with Nothing')
  t.equal(altNothing(false).isNothing(), true, 'nothing when passed false with Nothing')
  t.equal(altNothing(true).isNothing(), true, 'nothing when passed true with Nothing')
  t.equal(altNothing([]).isNothing(), true, 'nothing when passed an array with Nothing')
  t.equal(altNothing({}).isNothing(), true, 'nothing when passed an object with Nothing')
  t.equal(altNothing(m).isNothing(), true, 'nothing when container types differ on Nothing')

  t.end()
})

test('Maybe stand-alone alt errors', t => {
  const m = { type: () => 'Fake Maybe' }

  const altJustIsNothing = R.compose(isNothing, alt(Maybe.of(0)))

  t.ok(altJustIsNothing(undefined), 'nothing when passed an undefined with Just')
  t.ok(altJustIsNothing(null), 'nothing when passed a null with Just')
  t.ok(altJustIsNothing(0), 'nothing when passed a falsey number with Just')
  t.ok(altJustIsNothing(1), 'nothing when passed a truthy number with Just')
  t.ok(altJustIsNothing(''), 'nothing when passed a falsey string with Just')
  t.ok(altJustIsNothing('string'), 'nothing when passed a truthy string with Just')
  t.ok(altJustIsNothing(false), 'nothing when passed false with Just')
  t.ok(altJustIsNothing(true), 'nothing when passed true with Just')
  t.ok(altJustIsNothing([]), 'nothing when passed an array with Just')
  t.ok(altJustIsNothing({}), 'nothing when passed an object with Just')
  t.ok(altJustIsNothing(m), 'nothing when container types differ on Just')

  const altNothingIsNothing = R.compose(isNothing, alt(Maybe.Nothing()))

  t.ok(altNothingIsNothing(undefined), 'nothing when passed an undefined with Nothing')
  t.ok(altNothingIsNothing(null), 'nothing when passed a null with Nothing')
  t.ok(altNothingIsNothing(0), 'nothing when passed a falsey number with Nothing')
  t.ok(altNothingIsNothing(1), 'nothing when passed a truthy number with Nothing')
  t.ok(altNothingIsNothing(''), 'nothing when passed a falsey string with Nothing')
  t.ok(altNothingIsNothing('string'), 'nothing when passed a truthy string with Nothing')
  t.ok(altNothingIsNothing(false), 'nothing when passed false with Nothing')
  t.ok(altNothingIsNothing(true), 'nothing when passed true with Nothing')
  t.ok(altNothingIsNothing([]), 'nothing when passed an array with Nothing')
  t.ok(altNothingIsNothing({}), 'nothing when passed an object with Nothing')
  t.ok(altNothingIsNothing(m), 'nothing when container types differ on Nothing')

  t.end()
})

test('Maybe alt fantasy-land errors', t => {
  const m = { type: () => 'Maybe...Not' }

  const altJust = x => Maybe.of(0)[fantasyLand.alt](x)

  t.equal(altJust(undefined).isNothing(), true, 'nothing when passed an undefined with Just')
  t.equal(altJust(null).isNothing(), true, 'nothing when passed a null with Just')
  t.equal(altJust(0).isNothing(), true, 'nothing when passed a falsey number with Just')
  t.equal(altJust(1).isNothing(), true, 'nothing when passed a truthy number with Just')
  t.equal(altJust('').isNothing(), true, 'nothing when passed a falsey string with Just')
  t.equal(altJust('string').isNothing(), true, 'nothing when passed a truthy string with Just')
  t.equal(altJust(false).isNothing(), true, 'nothing when passed false with Just')
  t.equal(altJust(true).isNothing(), true, 'nothing when passed true with Just')
  t.equal(altJust([]).isNothing(), true, 'nothing when passed an array with Just')
  t.equal(altJust({}).isNothing(), true, 'nothing when passed an object with Just')
  t.equal(altJust(m).isNothing(), true, 'nothing when container types differ on Just')

  const altNothing = x => Maybe.Nothing()[fantasyLand.alt](x)

  t.equal(altNothing(undefined).isNothing(), true, 'nothing when passed an undefined with Nothing')
  t.equal(altNothing(null).isNothing(), true, 'nothing when passed a null with Nothing')
  t.equal(altNothing(0).isNothing(), true, 'nothing when passed a falsey number with Nothing')
  t.equal(altNothing(1).isNothing(), true, 'nothing when passed a truthy number with Nothing')
  t.equal(altNothing('').isNothing(), true, 'nothing when passed a falsey string with Nothing')
  t.equal(altNothing('string').isNothing(), true, 'nothing when passed a truthy string with Nothing')
  t.equal(altNothing(false).isNothing(), true, 'nothing when passed false with Nothing')
  t.equal(altNothing(true).isNothing(), true, 'nothing when passed true with Nothing')
  t.equal(altNothing([]).isNothing(), true, 'nothing when passed an array with Nothing')
  t.equal(altNothing({}).isNothing(), true, 'nothing when passed an object with Nothing')
  t.equal(altNothing(m).isNothing(), true, 'nothing when container types differ on Nothing')

  t.end()
})

test('Maybe alt functionality', t => {
  const just = Maybe.of('Just')
  const anotherJust = Maybe.of('Another Just')

  const nothing = Maybe.Nothing()
  const anotherNothing = Maybe.Nothing()

  const f = either(R.always('nothing'), R.identity)

  t.equals(f(just.alt(nothing).alt(anotherJust)), 'Just', 'retains first Just success')
  t.equals(f(nothing.alt(anotherNothing)), 'nothing', 'provdes Nothing when all Nothings')

  t.end()
})

test('Maybe stand-alone alt functionality', t => {
  const just = Maybe.of('Just')
  const anotherJust = Maybe.of('Another Just')

  const nothing = Maybe.Nothing()
  const anotherNothing = Maybe.Nothing()

  const f = either(R.always('nothing'), R.identity)

  const alt1 = alt(just)(nothing)
  const alt2 = alt(alt1)(anotherJust)
  const alt3 = altU(just, nothing)
  const alt4 = altU(alt3, anotherJust)

  const alt5 = alt(nothing)(anotherNothing)
  const alt6 = altU(nothing, anotherNothing)

  t.equals(f(alt2), 'Just', 'retains first Just success')
  t.equals(f(alt4), 'Just', 'retains first Just success')
  t.equals(f(alt5), 'nothing', 'provdes Nothing when all Nothings')
  t.equals(f(alt6), 'nothing', 'provdes Nothing when all Nothings')

  t.end()
})

test('Maybe ap errors', t => {
  const m = { type: () => 'Maybe...Not' }
  const ap = x => Maybe.Just(unit).ap(x)

  t.equal(Maybe(0).ap(null, Maybe(0)).isNothing(), true, 'nothing when wrapped value is a falsey number')
  t.equal(Maybe(1).ap(null, Maybe(0)).isNothing(), true, 'nothing when wrapped value is a truthy number')
  t.equal(Maybe('').ap(null, Maybe(0)).isNothing(), true, 'nothing when wrapped value is a falsey string')
  t.equal(Maybe('string').ap(null, Maybe(0)).isNothing(), true, 'nothing when wrapped value is a truthy string')
  t.equal(Maybe(false).ap(null, Maybe(0)).isNothing(), true, 'nothing when wrapped value is false')
  t.equal(Maybe(true).ap(null, Maybe(0)).isNothing(), true, 'nothing when wrapped value is true')
  t.equal(Maybe([]).ap(null, Maybe(0)).isNothing(), true, 'nothing when wrapped value is an array')
  t.equal(Maybe({}).ap(null, Maybe(0)).isNothing(), true, 'nothing when wrapped value is an object')

  t.equal(ap(undefined).isNothing(), true, 'nothing with undefined')
  t.equal(ap(null).isNothing(), true, 'nothing with null')
  t.equal(ap(0).isNothing(), true, 'nothing with falsey number')
  t.equal(ap(1).isNothing(), true, 'nothing with truthy number')
  t.equal(ap('').isNothing(), true, 'nothing with falsey string')
  t.equal(ap('string').isNothing(), true, 'nothing with truthy string')
  t.equal(ap(false).isNothing(), true, 'nothing with false')
  t.equal(ap(true).isNothing(), true, 'nothing with true')
  t.equal(ap([]).isNothing(), true, 'nothing with an array')
  t.equal(ap({}).isNothing(), true, 'nothing with an object')
  t.equal(ap(m).isNothing(), true, 'nothing when container types differ')

  t.doesNotThrow(() => ap(Maybe.Just(0)), 'allows a Maybe')

  t.end()
})

test('Maybe stand-alone ap errors', t => {
  const m = { type: () => 'Fake Maybe' }
  const checker = R.compose(isNothing, ap(Maybe.Just(unit)))

  t.ok(ap(Maybe(0))(null, Maybe(0)).isNothing(), 'nothing when wrapped value is a falsey number')
  t.ok(ap(Maybe(1))(null, Maybe(0)).isNothing(), 'nothing when wrapped value is a truthy number')
  t.ok(ap(Maybe(''))(null, Maybe(0)).isNothing(), 'nothing when wrapped value is a falsey string')
  t.ok(ap(Maybe('string'))(null, Maybe(0)).isNothing(), 'nothing when wrapped value is a truthy string')
  t.ok(ap(Maybe(false))(null, Maybe(0)).isNothing(), 'nothing when wrapped value is false')
  t.ok(ap(Maybe(true))(null, Maybe(0)).isNothing(), 'nothing when wrapped value is true')
  t.ok(ap(Maybe([]))(null, Maybe(0)).isNothing(), 'nothing when wrapped value is an array')
  t.ok(ap(Maybe({}))(null, Maybe(0)).isNothing(), 'nothing when wrapped value is an object')

  t.ok(checker(undefined), 'nothing with undefined')
  t.ok(checker(null), 'nothing with null')
  t.ok(checker(0), 'nothing with falsey number')
  t.ok(checker(1), 'nothing with truthy number')
  t.ok(checker(''), 'nothing with falsey string')
  t.ok(checker('string'), 'nothing with truthy string')
  t.ok(checker(false), 'nothing with false')
  t.ok(checker(true), 'nothing with true')
  t.ok(checker([]), 'nothing with an array')
  t.ok(checker({}), 'nothing with an object')
  t.ok(checker(m), 'nothing when container types differ')

  t.doesNotThrow(() => checker(Maybe.Just(0)), 'allows a Maybe')

  t.end()
})

test('Maybe ap example', t => {
  const doubleIt = R.multiply(2)
  const wrapIt = R.ifElse(
    R.is(Number),
    Maybe.of,
    Maybe.Nothing
  )
  const safeDouble = R.compose(Maybe.of(doubleIt).ap, wrapIt)
  const nothingOption = '__NOTHING_OPTION__'

  t.equal(safeDouble(10).valueOr(nothingOption), 20, 'Doubles the value safely')
  t.equal(safeDouble(0).valueOr(nothingOption), 0, 'Handles zero just fine')
  t.equal(safeDouble(null).valueOr(nothingOption), nothingOption, 'Safely handles a null using Nothing')
  t.equal(safeDouble([ 1, 2 ]).valueOr(nothingOption), nothingOption, 'Safely handles a non-number using Nothing')
  t.equal(safeDouble('one hundred').valueOr(nothingOption), nothingOption, 'Safely handles a string using Nothing')
  t.equal(safeDouble(() => 99).valueOr(nothingOption), nothingOption, 'Safely handles a function using Nothing')

  t.end()
})

test('Maybe stand-alone ap example', t => {
  const doubleIt = R.multiply(2)
  const wrapIt = R.ifElse(
    R.is(Number),
    Maybe.of,
    Maybe.Nothing
  )
  const nothingOption = '__NOTHING_OPTION__'
  const checker = R.compose(valueOr(nothingOption), ap(Maybe.of(doubleIt)), wrapIt)

  t.equal(checker(10), 20, 'Doubles the value safely')
  t.equal(checker(0), 0, 'Handles zero just fine')
  t.equal(checker(null), nothingOption, 'Safely handles a null using Nothing')
  t.equal(checker([ 1, 2 ]), nothingOption, 'Safely handles a non-number using Nothing')
  t.equal(checker('one hundred'), nothingOption, 'Safely handles a string using Nothing')
  t.equal(checker(() => 99), nothingOption, 'Safely handles a function using Nothing')

  t.end()
})

test('Maybe ap demo', t => {
  const a = Maybe.of(3)
  const f = Maybe.of(R.multiply(2))
  const n = Maybe.Nothing()

  const af = a.ap(f)
  const fa = f.ap(a)
  const fn = f.ap(n)
  const na = n.ap(a)

  test(af.toString(), 'Just 6', 'a ap f')
  test(fa.toString(), 'Just 6', 'f ap a')
  test(fn.isNothing(), true, 'f ap nothing')
  test(na.isNothing(), true, 'nothing ap f')

  t.end()
})

test('Maybe stand-alone ap demo', t => {
  const a = Maybe.of(3)
  const f = Maybe.of(R.multiply(2))
  const n = Maybe.Nothing()

  const af = ap(a)(f)
  const fa = ap(f)(a)
  const fn = ap(f)(n)
  const na = ap(n)(a)

  const af2 = apU(a, f)
  const fa2 = apU(f, a)
  const fn2 = apU(f, n)
  const na2 = apU(n, a)

  test(af.toString(), 'Just 6', 'a ap f')
  test(fa.toString(), 'Just 6', 'f ap a')
  test(fn.isNothing(), true, 'f ap nothing')
  test(na.isNothing(), true, 'nothing ap f')
  test(af2.toString(), 'Just 6', 'a ap f')
  test(fa2.toString(), 'Just 6', 'f ap a')
  test(fn2.isNothing(), true, 'f ap nothing')
  test(na2.isNothing(), true, 'nothing ap f')

  t.end()
})

test('Maybe asyncOf errors', t => {
  const f = x => Maybe.asyncOf(x)
  const nl = f(null)
  const un = f(undefined)
  const nm = f(1)
  const st = f('x')
  const bl = f(true)
  const ar = f([ 1 ])
  const ob = f({ x: 1 })
  const fn = f(x => x)

  t.equal(nl.isNothing(), true, 'null goes nothing')
  t.equal(nl.promise, undefined, 'null has no promise')
  t.equal(un.isNothing(), true, 'undefined goes nothing')
  t.equal(un.promise, undefined, 'undefined has no promise')
  t.equal(nm.isNothing(), true, 'number goes nothing')
  t.equal(nm.promise, undefined, 'number has no promise')
  t.equal(st.isNothing(), true, 'string goes nothing')
  t.equal(st.promise, undefined, 'string has no promise')
  t.equal(bl.isNothing(), true, 'boolean goes nothing')
  t.equal(bl.promise, undefined, 'boolean has no promise')
  t.equal(ar.isNothing(), true, 'array goes nothing')
  t.equal(ar.promise, undefined, 'array has no promise')
  t.equal(ob.isNothing(), true, 'object goes nothing')
  t.equal(ob.promise, undefined, 'object has no promise')
  t.equal(fn.isNothing(), true, 'function goes nothing')
  t.equal(fn.promise, undefined, 'function has no promise')

  t.end()
})

test('Maybe asyncOf before', t => {
  const promiseResponse = 'response never received'
  const promise = Promise.reject(promiseResponse)
  const a = Maybe.asyncOf(promise)
  const opt = '_OPT_FOR_NOTHING_'

  t.equal(a.isNothing(), true, 'is nothing before resolve')
  t.equal(a.valueOr(opt), opt, 'contains nothing')
  t.equal(a.promise, promise, 'resolved promise is there')
  t.equal(Object.isFrozen(a), false, 'is not frozen yet')

  t.end()
})

test('Maybe asyncOf after', t => {
  const promiseResponse = 'response received'
  const promise = Promise.resolve(promiseResponse)
  const a = Maybe.asyncOf(promise)
  const opt = '_OPT_FOR_NOTHING_'

  promise.then(() => {
    t.equal(a.isNothing(), false, 'is not nothing after resolve')
    t.equal(a.valueOr(opt), promiseResponse, 'contains the resolve value')
    t.equal(a.promise, undefined, 'resolved promise goes undefined')
    t.equal(Object.isFrozen(a), true, 'Maybe is now frozen')

    t.end()
  })
})

test('Maybe chain errors', t => {
  const chain = bindFunc(Maybe(0).chain)

  const noFunc = /f is not a function/
  t.throws(chain(undefined), noFunc, 'throws with undefined')
  t.throws(chain(null), noFunc, 'throws with null')
  t.throws(chain(0), noFunc, 'throws with falsey number')
  t.throws(chain(1), noFunc, 'throws with truthy number')
  t.throws(chain(''), noFunc, 'throws with falsey string')
  t.throws(chain('string'), noFunc, 'throws with truthy string')
  t.throws(chain(false), noFunc, 'throws with false')
  t.throws(chain(true), noFunc, 'throws with true')
  t.throws(chain([]), noFunc, 'throws with an array')
  t.throws(chain({}), noFunc, 'throws with an object')

  t.equal(chain(unit)().isNothing(), true, 'nothing with a non-Maybe returning function')

  t.doesNotThrow(chain(Maybe.of), 'allows a Maybe returning function')

  t.end()
})

test('Maybe stand-alone chain errors', t => {
  const chainer = bindFunc(f => chain(f)(Maybe(0)))
  const chainerU = bindFunc(f => chainU(f, Maybe(0)))

  const noFunc = /f is not a function/

  t.throws(chainer(undefined), noFunc, 'standalone throws with undefined')
  t.throws(chainer(null), noFunc, 'standalone throws with null')
  t.throws(chainer(0), noFunc, 'standalone throws with falsey number')
  t.throws(chainer(1), noFunc, 'standalone throws with truthy number')
  t.throws(chainer(''), noFunc, 'standalone throws with falsey string')
  t.throws(chainer('string'), noFunc, 'standalone throws with truthy string')
  t.throws(chainer(false), noFunc, 'standalone throws with false')
  t.throws(chainer(true), noFunc, 'standalone throws with true')
  t.throws(chainer([]), noFunc, 'standalone throws with an array')
  t.throws(chainer({}), noFunc, 'standalone throws with an object')

  t.equal(chainer(unit)().isNothing(), true, 'nothing with a non-Maybe returning function')

  t.doesNotThrow(chainer(Maybe.of), 'allows a Maybe returning function')

  t.throws(chainerU(undefined), noFunc, 'uncurried throws with undefined')
  t.throws(chainerU(null), noFunc, 'uncurried throws with null')
  t.throws(chainerU(0), noFunc, 'uncurried throws with falsey number')
  t.throws(chainerU(1), noFunc, 'uncurried throws with truthy number')
  t.throws(chainerU(''), noFunc, 'uncurried throws with falsey string')
  t.throws(chainerU('string'), noFunc, 'uncurried throws with truthy string')
  t.throws(chainerU(false), noFunc, 'uncurried throws with false')
  t.throws(chainerU(true), noFunc, 'uncurried throws with true')
  t.throws(chainerU([]), noFunc, 'uncurried throws with an array')
  t.throws(chainerU({}), noFunc, 'uncurried throws with an object')

  t.equal(chainerU(unit)().isNothing(), true, 'nothing with a non-Maybe returning function')

  t.doesNotThrow(chainerU(Maybe.of), 'allows a Maybe returning function')

  t.end()
})

test('Maybe chain fantasy-land errors', t => {
  const chain = bindFunc(Maybe(0)[fantasyLand.chain])

  const noFunc = /f is not a function/
  t.throws(chain(undefined), noFunc, 'throws with undefined')
  t.throws(chain(null), noFunc, 'throws with null')
  t.throws(chain(0), noFunc, 'throws with falsey number')
  t.throws(chain(1), noFunc, 'throws with truthy number')
  t.throws(chain(''), noFunc, 'throws with falsey string')
  t.throws(chain('string'), noFunc, 'throws with truthy string')
  t.throws(chain(false), noFunc, 'throws with false')
  t.throws(chain(true), noFunc, 'throws with true')
  t.throws(chain([]), noFunc, 'throws with an array')
  t.throws(chain({}), noFunc, 'throws with an object')

  t.equal(chain(unit)().isNothing(), true, 'nothing with a non-Maybe returning function')

  t.doesNotThrow(chain(Maybe.of), 'allows a Maybe returning function')

  t.end()
})

test('Maybe chain demo', t => {
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
  const pets = a.chain(isPet)
  const actives = a.chain(isActive)
  const activeCPets = a.chain(startsWithC).chain(isPet).chain(isActive)
  const nonstarter = Maybe.Nothing().chain(startsWithC).chain(isPet).chain(isActive)

  t.equal(cs.map(item => item.value).toString(), 'Just ["cat","cherry"]',
    'chains starts with c')
  t.equal(pets.map(item => item.value).toString(),
    'Just ["cat","dog","bird"]', 'chains pets')
  t.equal(actives.map(item => item.value).toString(),
    'Just ["cat","dog","cherry"]', 'chains actives')
  t.equal(activeCPets.map(item => item.value).toString(),
    'Just ["cat"]', 'chains starts with c, pets, and active')
  t.equal(nonstarter.isNothing(), true, 'starting with nothing is a nonstarter')

  t.end()
})

test('Maybe stand-alone chain demo', t => {
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

  const cChain = chain(startsWithC)
  const petChain = chain(isPet)
  const activeChain = chain(isActive)
  const activeCPets = R.compose(cChain, petChain, activeChain)

  const cs = chainU(startsWithC, a)
  const pets = chainU(isPet, a)
  const actives = chainU(isActive, a)
  const activeCs = chainU(isActive, cs)
  const activeCPets2 = chainU(isPet, activeCs)
  const nonstarter = chainU(startsWithC, Maybe.Nothing())
  const stillnonstarter = chainU(isPet, nonstarter)

  t.equal(cChain(a).map(item => item.value).toString(), 'Just ["cat","cherry"]',
    'chains starts with c')
  t.equal(petChain(a).map(item => item.value).toString(),
    'Just ["cat","dog","bird"]', 'chains pets')
  t.equal(activeChain(a).map(item => item.value).toString(),
    'Just ["cat","dog","cherry"]', 'chains actives')
  t.equal(activeCPets(a).map(item => item.value).toString(),
    'Just ["cat"]', 'chains starts with c, pets, and active')
  t.equal(activeCPets(Maybe.Nothing()).isNothing(), true, 'starting with nothing is a nonstarter')
  t.equal(cs.map(item => item.value).toString(), 'Just ["cat","cherry"]',
    'chains starts with c')
  t.equal(pets.map(item => item.value).toString(),
    'Just ["cat","dog","bird"]', 'chains pets')
  t.equal(actives.map(item => item.value).toString(),
    'Just ["cat","dog","cherry"]', 'chains actives')
  t.equal(activeCPets2.map(item => item.value).toString(),
    'Just ["cat"]', 'chains starts with c, pets, and active')
  t.equal(nonstarter.isNothing(), true, 'starting with nothing is a nonstarter')
  t.equal(stillnonstarter.isNothing(), true, 'starting with nothing is a nonstarter')

  t.end()
})

test('Maybe concat mismatches', t => {
  const m = { type: () => 'Maybe...Not' }

  const good = Maybe.of([])

  const f = () => Maybe.of([]).concat

  t.equal(f()(undefined).isNothing(), true, 'nothing with undefined')
  t.equal(f()(null).isNothing(), true, 'nothing with null')
  t.equal(f()(0).isNothing(), true, 'nothing with falsey number')
  t.equal(f()(1).isNothing(), true, 'nothing with truthy number')
  t.equal(f()('').isNothing(), true, 'nothing with falsey string')
  t.equal(f()('string').isNothing(), true, 'nothing with truthy string')
  t.equal(f()(false).isNothing(), true, 'nothing with false')
  t.equal(f()(true).isNothing(), true, 'nothing with true')
  t.equal(f()([]).isNothing(), true, 'nothing with array')
  t.equal(f()({}).isNothing(), true, 'nothing with object')
  t.equal(f()(m).isNothing(), true, 'nothing with non-Maybe')

  const nothingDefault = '__NOTHING_DEFAULT__'
  const notSemiLeft = x => Maybe.of(x).concat(good).valueOr(nothingDefault)
  const goodValue = good.valueOr(nothingDefault + '__GOOD__')

  t.equal(notSemiLeft(undefined), goodValue, 'good again with undefined on left')
  t.equal(notSemiLeft(null), goodValue, 'good again with null on left')
  t.equal(notSemiLeft(0), nothingDefault, 'nothing with falsey number on left')
  t.equal(notSemiLeft(1), nothingDefault, 'nothing with truthy number on left')
  t.equal(notSemiLeft(''), nothingDefault, 'nothing with falsey string on left')
  t.equal(notSemiLeft('string'), nothingDefault, 'nothing with truthy string on left')
  t.equal(notSemiLeft(false), nothingDefault, 'nothing with false on left')
  t.equal(notSemiLeft(true), nothingDefault, 'nothing with true on left')
  t.equal(notSemiLeft({}), nothingDefault, 'nothing with object on left')

  const notSemiRight = x => good.concat(Maybe.of(x)).valueOr(nothingDefault)

  t.equal(notSemiRight(undefined), goodValue, 'good again with undefined on right')
  t.equal(notSemiRight(null), goodValue, 'good again with null on right')
  t.equal(notSemiRight(0), nothingDefault, 'nothing with falsey number on right')
  t.equal(notSemiRight(1), nothingDefault, 'nothing with truthy number on right')
  t.equal(notSemiRight(''), nothingDefault, 'nothing with falsey string on right')
  t.equal(notSemiRight('string'), nothingDefault, 'nothing with truthy string on right')
  t.equal(notSemiRight(false), nothingDefault, 'nothing with false on right')
  t.equal(notSemiRight(true), nothingDefault, 'nothing with true on right')
  t.equal(notSemiRight({}), nothingDefault, 'nothing with object on right')

  t.end()
})

test('Maybe stand-alone concat mismatches', t => {
  const m = { type: () => 'Maybe...Not' }

  const good = Maybe.of([])

  const f = concat(good)
  const fu = x => concatU(good, x)

  t.equal(f(undefined).isNothing(), true, 'nothing with undefined')
  t.equal(f(null).isNothing(), true, 'nothing with null')
  t.equal(f(0).isNothing(), true, 'nothing with falsey number')
  t.equal(f(1).isNothing(), true, 'nothing with truthy number')
  t.equal(f('').isNothing(), true, 'nothing with falsey string')
  t.equal(f('string').isNothing(), true, 'nothing with truthy string')
  t.equal(f(false).isNothing(), true, 'nothing with false')
  t.equal(f(true).isNothing(), true, 'nothing with true')
  t.equal(f([]).isNothing(), true, 'nothing with array')
  t.equal(f({}).isNothing(), true, 'nothing with object')
  t.equal(f(m).isNothing(), true, 'nothing with non-Maybe')

  t.equal(fu(undefined).isNothing(), true, 'nothing with undefined')
  t.equal(fu(null).isNothing(), true, 'nothing with null')
  t.equal(fu(0).isNothing(), true, 'nothing with falsey number')
  t.equal(fu(1).isNothing(), true, 'nothing with truthy number')
  t.equal(fu('').isNothing(), true, 'nothing with falsey string')
  t.equal(fu('string').isNothing(), true, 'nothing with truthy string')
  t.equal(fu(false).isNothing(), true, 'nothing with false')
  t.equal(fu(true).isNothing(), true, 'nothing with true')
  t.equal(fu([]).isNothing(), true, 'nothing with array')
  t.equal(fu({}).isNothing(), true, 'nothing with object')
  t.equal(fu(m).isNothing(), true, 'nothing with non-Maybe')

  const nothingDefault = '__NOTHING_DEFAULT__'
  const checkValue = valueOr(nothingDefault)
  const notSemiLeft = x => checkValue(concat(Maybe.of(x))(good))
  const notSemiLeftU = x => checkValue(concatU(Maybe.of(x), good))
  const goodValue = valueOr(nothingDefault + '__GOOD__')(good)

  t.equal(notSemiLeft(undefined), goodValue, 'good again with undefined on left')
  t.equal(notSemiLeft(null), goodValue, 'good again with null on left')
  t.equal(notSemiLeft(0), nothingDefault, 'nothing with falsey number on left')
  t.equal(notSemiLeft(1), nothingDefault, 'nothing with truthy number on left')
  t.equal(notSemiLeft(''), nothingDefault, 'nothing with falsey string on left')
  t.equal(notSemiLeft('string'), nothingDefault, 'nothing with truthy string on left')
  t.equal(notSemiLeft(false), nothingDefault, 'nothing with false on left')
  t.equal(notSemiLeft(true), nothingDefault, 'nothing with true on left')
  t.equal(notSemiLeft({}), nothingDefault, 'nothing with object on left')

  t.equal(notSemiLeftU(undefined), goodValue, 'good again with undefined on left')
  t.equal(notSemiLeftU(null), goodValue, 'good again with null on left')
  t.equal(notSemiLeftU(0), nothingDefault, 'nothing with falsey number on left')
  t.equal(notSemiLeftU(1), nothingDefault, 'nothing with truthy number on left')
  t.equal(notSemiLeftU(''), nothingDefault, 'nothing with falsey string on left')
  t.equal(notSemiLeftU('string'), nothingDefault, 'nothing with truthy string on left')
  t.equal(notSemiLeftU(false), nothingDefault, 'nothing with false on left')
  t.equal(notSemiLeftU(true), nothingDefault, 'nothing with true on left')
  t.equal(notSemiLeftU({}), nothingDefault, 'nothing with object on left')

  const notSemiRight = x => checkValue(concat(good)(Maybe.of(x)))
  const notSemiRightU = x => checkValue(concatU(good, Maybe.of(x)))

  t.equal(notSemiRight(undefined), goodValue, 'good again with undefined on right')
  t.equal(notSemiRight(null), goodValue, 'good again with null on right')
  t.equal(notSemiRight(0), nothingDefault, 'nothing with falsey number on right')
  t.equal(notSemiRight(1), nothingDefault, 'nothing with truthy number on right')
  t.equal(notSemiRight(''), nothingDefault, 'nothing with falsey string on right')
  t.equal(notSemiRight('string'), nothingDefault, 'nothing with truthy string on right')
  t.equal(notSemiRight(false), nothingDefault, 'nothing with false on right')
  t.equal(notSemiRight(true), nothingDefault, 'nothing with true on right')
  t.equal(notSemiRight({}), nothingDefault, 'nothing with object on right')

  t.equal(notSemiRightU(undefined), goodValue, 'good again with undefined on right')
  t.equal(notSemiRightU(null), goodValue, 'good again with null on right')
  t.equal(notSemiRightU(0), nothingDefault, 'nothing with falsey number on right')
  t.equal(notSemiRightU(1), nothingDefault, 'nothing with truthy number on right')
  t.equal(notSemiRightU(''), nothingDefault, 'nothing with falsey string on right')
  t.equal(notSemiRightU('string'), nothingDefault, 'nothing with truthy string on right')
  t.equal(notSemiRightU(false), nothingDefault, 'nothing with false on right')
  t.equal(notSemiRightU(true), nothingDefault, 'nothing with true on right')
  t.equal(notSemiRightU({}), nothingDefault, 'nothing with object on right')

  t.end()
})

test('Maybe concat errors', t => {

  const good = Maybe.of([])
  const noMatch = () => good.concat(Maybe.of(''))
  const noMatchU = () => concatU(good, Maybe.of(''))

  t.equal(noMatch().isNothing(), true, 'nothing with different semigroups')
  t.equal(noMatchU().isNothing(), true, 'nothing with different semigroups')

  t.end()
})

test('Maybe stand-alone concat errors', t => {

  const good = concat(Maybe.of([]))

  const noMatch = () => good(Maybe.of(''))
  t.equal(noMatch().isNothing(), true, 'nothing with different semigroups')

  t.end()
})

test('Maybe concat fantasy-land errors', t => {
  const m = { type: () => 'Maybe...Not' }

  const good = Maybe.of([])

  const f = () => Maybe.of([])[fantasyLand.concat]

  t.equal(f()(undefined).isNothing(), true, 'nothing with undefined')
  t.equal(f()(null).isNothing(), true, 'nothing with null')
  t.equal(f()(0).isNothing(), true, 'nothing with falsey number')
  t.equal(f()(1).isNothing(), true, 'nothing with truthy number')
  t.equal(f()('').isNothing(), true, 'nothing with falsey string')
  t.equal(f()('string').isNothing(), true, 'nothing with truthy string')
  t.equal(f()(false).isNothing(), true, 'nothing with false')
  t.equal(f()(true).isNothing(), true, 'nothing with true')
  t.equal(f()([]).isNothing(), true, 'nothing with array')
  t.equal(f()({}).isNothing(), true, 'nothing with object')
  t.equal(f()(m).isNothing(), true, 'nothing with non-Maybe')

  const nothingDefault = '__NOTHING_DEFAULT__'
  const notSemiLeft = x => Maybe.of(x)[fantasyLand.concat](good).valueOr(nothingDefault)
  const goodValue = good.valueOr(nothingDefault + '__GOOD__')

  t.equal(notSemiLeft(undefined), goodValue, 'good again with undefined on left')
  t.equal(notSemiLeft(null), goodValue, 'good again with null on left')
  t.equal(notSemiLeft(0), nothingDefault, 'nothing with falsey number on left')
  t.equal(notSemiLeft(1), nothingDefault, 'nothing with truthy number on left')
  t.equal(notSemiLeft(''), nothingDefault, 'nothing with falsey string on left')
  t.equal(notSemiLeft('string'), nothingDefault, 'nothing with truthy string on left')
  t.equal(notSemiLeft(false), nothingDefault, 'nothing with false on left')
  t.equal(notSemiLeft(true), nothingDefault, 'nothing with true on left')
  t.equal(notSemiLeft({}), nothingDefault, 'nothing with object on left')

  const notSemiRight = x => good[fantasyLand.concat](Maybe.of(x)).valueOr(nothingDefault)

  t.equal(notSemiRight(undefined), goodValue, 'good again with undefined on right')
  t.equal(notSemiRight(null), goodValue, 'good again with null on right')
  t.equal(notSemiRight(0), nothingDefault, 'nothing with falsey number on right')
  t.equal(notSemiRight(1), nothingDefault, 'nothing with truthy number on right')
  t.equal(notSemiRight(''), nothingDefault, 'nothing with falsey string on right')
  t.equal(notSemiRight('string'), nothingDefault, 'nothing with truthy string on right')
  t.equal(notSemiRight(false), nothingDefault, 'nothing with false on right')
  t.equal(notSemiRight(true), nothingDefault, 'nothing with true on right')
  t.equal(notSemiRight({}), nothingDefault, 'nothing with object on right')

  const noMatch = () => good[fantasyLand.concat](Maybe.of(''))
  t.equal(noMatch().isNothing(), true, 'nothing with different semigroups')

  t.end()
})

test('Maybe concat functionality', t => {
  const extract =
    either(R.always('Nothing'), R.identity)

  const nothing = Maybe.Nothing()
  const a = Maybe.Just([ 1, 2 ])
  const b = Maybe.Just([ 4, 3 ])

  const just = a.concat(b)
  const nothingRight = a.concat(nothing)
  const nothingLeft = nothing.concat(a)

  t.ok(isSameType(Maybe, just), 'returns another Maybe with Just')
  t.ok(isSameType(Maybe, nothingRight), 'returns another Maybe with Nothing on Right')
  t.ok(isSameType(Maybe, nothingLeft), 'returns another Maybe with Nothing on Left')

  t.same(extract(just), [ 1, 2, 4, 3 ], 'concats the inner semigroup with Justs')
  t.same(extract(nothingRight), [ 1, 2 ], 'returns a with a Nothing on Right')
  t.same(extract(nothingLeft), [ 1, 2 ], 'returns a with a Nothing on Left')

  const a$ = Maybe.Just('front')
  const b$ = Maybe.Just('back')
  const c$ = a$.concat(b$)

  t.equal(extract(c$), 'frontback', 'implements the ramda concat on strings')

  const af = Maybe.Just(() => 'front')
  const bf = Maybe.Just(() => 'back')
  const cf = af.concat(bf)

  t.equal(cf.isNothing(), true, 'returns nothing on 2 functions')

  t.end()
})

test('Maybe stand-alone concat functionality', t => {
  const extract =
    either(R.always('Nothing'), R.identity)

  const nothing = Maybe.Nothing()
  const a = Maybe.Just([ 1, 2 ])
  const b = Maybe.Just([ 4, 3 ])

  const just = concat(a)(b)
  const justU = concatU(a, b)
  const nothingRight = concat(a)(nothing)
  const nothingRightU = concatU(a, nothing)
  const nothingLeft = concat(nothing)(a)
  const nothingLeftU = concatU(nothing, a)

  t.ok(isSameType(Maybe, just), 'returns another Maybe with Just')
  t.ok(isSameType(Maybe, nothingRight), 'returns another Maybe with Nothing on Right')
  t.ok(isSameType(Maybe, nothingLeft), 'returns another Maybe with Nothing on Left')

  t.ok(isSameType(Maybe, justU), 'returns another Maybe with Just')
  t.ok(isSameType(Maybe, nothingRightU), 'returns another Maybe with Nothing on Right')
  t.ok(isSameType(Maybe, nothingLeftU), 'returns another Maybe with Nothing on Left')

  t.same(extract(just), [ 1, 2, 4, 3 ], 'concats the inner semigroup with Justs')
  t.same(extract(nothingRight), [ 1, 2 ], 'returns a with a Nothing on Right')
  t.same(extract(nothingLeft), [ 1, 2 ], 'returns a with a Nothing on Left')

  t.same(extract(justU), [ 1, 2, 4, 3 ], 'concats the inner semigroup with Justs')
  t.same(extract(nothingRightU), [ 1, 2 ], 'returns a with a Nothing on Right')
  t.same(extract(nothingLeftU), [ 1, 2 ], 'returns a with a Nothing on Left')

  const a$ = Maybe.Just('front')
  const b$ = Maybe.Just('back')
  const c$ = concat(a$)(b$)
  const cu$ = concatU(a$, b$)

  t.equal(extract(c$), 'frontback', 'implements the ramda concat on strings')
  t.equal(extract(cu$), 'frontback', 'implements the ramda concat on strings')

  const af = Maybe.Just(() => 'front')
  const bf = Maybe.Just(() => 'back')
  const cf = concat(af)(bf)
  const cfu = concatU(af, bf)

  t.equal(cf.isNothing(), true, 'returns nothing on 2 functions')
  t.equal(cfu.isNothing(), true, 'returns nothing on 2 functions')

  t.end()
})

test('Maybe concat demo', t => {
  const a = Maybe.of([ 1, 3, 5 ])
  const b = Maybe.of([ 6, 8 ])
  const c = Maybe.of([ 9 ])
  const n = Maybe.Nothing()

  const nothingValue = '_NOTHING_DEFAULT'

  t.deepEqual(a.concat(b).valueOr(nothingValue), [ 1, 3, 5, 6, 8 ], 'simple concat')
  t.deepEqual(b.concat(c).valueOr(nothingValue), [ 6, 8, 9 ], 'another simple concat')
  t.deepEqual(a.concat(n).valueOr(nothingValue), [ 1, 3, 5 ], 'a concat nothing')
  t.deepEqual(n.concat(b).valueOr(nothingValue), [ 6, 8 ], 'nothing concat b')
  t.deepEqual(a.concat(b).concat(c).valueOr(nothingValue), [ 1, 3, 5, 6, 8, 9 ], '2 concats')
  t.deepEqual(a.concat(b.concat(c)).valueOr(nothingValue), [ 1, 3, 5, 6, 8, 9 ], '2 concats different association')
  t.deepEqual(a.concat(n).concat(c).valueOr(nothingValue), [ 1, 3, 5, 9 ],
    'nothing in the middle disappears')

  t.end()
})

test('Maybe stand-alone concat demo', t => {
  const a = Maybe.of([ 1, 3, 5 ])
  const b = Maybe.of([ 6, 8 ])
  const c = Maybe.of([ 9 ])
  const n = Maybe.Nothing()

  const nothingValue = '_NOTHING_DEFAULT'
  const checkValue = valueOr(nothingValue)
  const concatWithA = concat(a)
  const concatWithB = concat(b)
  const concatWithN = concat(n)

  t.deepEqual(checkValue(concatWithA(b)), [ 1, 3, 5, 6, 8 ], 'simple concat')
  t.deepEqual(checkValue(concatWithB(c)), [ 6, 8, 9 ], 'another simple concat')
  t.deepEqual(checkValue(concatWithA(n)), [ 1, 3, 5 ], 'a concat nothing')
  t.deepEqual(checkValue(concatWithN(b)), [ 6, 8 ], 'nothing concat b')
  t.deepEqual(checkValue(concat(concatWithA(b))(c)), [ 1, 3, 5, 6, 8, 9 ], '2 concats')
  t.deepEqual(checkValue(concatWithA(concatWithB(c))), [ 1, 3, 5, 6, 8, 9 ], '2 concats different association')
  t.deepEqual(checkValue(concat(concatWithA(n))(c)), [ 1, 3, 5, 9 ],
    'nothing in the middle disappears')

  t.deepEqual(checkValue(concatU(a, b)), [ 1, 3, 5, 6, 8 ], 'simple concat')
  t.deepEqual(checkValue(concatU(b, c)), [ 6, 8, 9 ], 'another simple concat')
  t.deepEqual(checkValue(concatU(a, n)), [ 1, 3, 5 ], 'a concat nothing')
  t.deepEqual(checkValue(concatU(n, b)), [ 6, 8 ], 'nothing concat b')
  t.deepEqual(checkValue(concatU(concatU(a, b), c)), [ 1, 3, 5, 6, 8, 9 ], '2 concats')
  t.deepEqual(checkValue(concatU(a, concatU(b, c))), [ 1, 3, 5, 6, 8, 9 ], '2 concats different association')
  t.deepEqual(checkValue(concatU(concatU(a, n), c)), [ 1, 3, 5, 9 ],
    'nothing in the middle disappears')

  t.end()
})

test('Maybe concat string demo', t => {
  const a = Maybe.of('135')
  const b = Maybe.of('68')
  const c = Maybe.of('9')
  const n = Maybe.Nothing()

  const nothingValue = '_NOTHING_DEFAULT'

  t.deepEqual(a.concat(b).valueOr(nothingValue), '13568', 'simple concat')
  t.deepEqual(b.concat(c).valueOr(nothingValue), '689', 'another simple concat')
  t.deepEqual(a.concat(n).valueOr(nothingValue), '135', 'a concat nothing')
  t.deepEqual(n.concat(b).valueOr(nothingValue), '68', 'nothing concat b')
  t.deepEqual(a.concat(b).concat(c).valueOr(nothingValue), '135689', '2 concats')
  t.deepEqual(a.concat(b.concat(c)).valueOr(nothingValue), '135689', '2 concats different association')
  t.deepEqual(a.concat(n).concat(c).valueOr(nothingValue), '1359',
    'nothing in the middle disappears')

  t.end()
})

test('Maybe stand-alone concat string demo', t => {
  const a = Maybe.of('135')
  const b = Maybe.of('68')
  const c = Maybe.of('9')
  const n = Maybe.Nothing()

  const concatWithA = concat(a)
  const concatWithB = concat(b)
  const concatWithN = concat(n)

  const nothingValue = '_NOTHING_DEFAULT'
  const checkValue = valueOr(nothingValue)

  t.deepEqual(checkValue(concatWithA(b)), '13568', 'simple concat')
  t.deepEqual(checkValue(concatWithB(c)), '689', 'another simple concat')
  t.deepEqual(checkValue(concatWithA(n)), '135', 'a concat nothing')
  t.deepEqual(checkValue(concatWithN(b)), '68', 'nothing concat b')
  t.deepEqual(checkValue(concat(concatWithA(b))(c)), '135689', '2 concats')
  t.deepEqual(checkValue(concat(a)(concatWithB(c))), '135689', '2 concats different association')
  t.deepEqual(checkValue(concat(concatWithA(n))(c)), '1359',
    'nothing in the middle disappears')

  t.deepEqual(checkValue(concatU(a, b)), '13568', 'simple concat')
  t.deepEqual(checkValue(concatU(b, c)), '689', 'another simple concat')
  t.deepEqual(checkValue(concatU(a, n)), '135', 'a concat nothing')
  t.deepEqual(checkValue(concatU(n, b)), '68', 'nothing concat b')
  t.deepEqual(checkValue(concatU(concatU(a, b), c)), '135689', '2 concats')
  t.deepEqual(checkValue(concatU(a, concatU(b, c))), '135689', '2 concats different association')
  t.deepEqual(checkValue(concatU(concatU(a, n), c)), '1359',
    'nothing in the middle disappears')

  t.end()
})

test('Maybe either', t => {
  const fn = bindFunc(Maybe.Nothing().either)
  const fj = bindFunc(Maybe.Just(23).either)

  const err = /left is not a function/
  t.throws(fn(), err, 'throws when nothing passed')
  t.throws(fn(null, unit), err, 'throws with null in left')
  t.throws(fn(undefined, unit), err, 'throws with undefined in left')
  t.throws(fn(0, unit), err, 'throws with falsey number in left')
  t.throws(fn(1, unit), err, 'throws with truthy number in left')
  t.throws(fn('', unit), err, 'throws with falsey string in left')
  t.throws(fn('string', unit), err, 'throws with truthy string in left')
  t.throws(fn(false, unit), err, 'throws with false in left')
  t.throws(fn(true, unit), err, 'throws with true in left')
  t.throws(fn({}, unit), err, 'throws with object in left')
  t.throws(fn([], unit), err, 'throws with array in left')

  const righterr = /right is not a function/
  t.throws(fj(unit, null), righterr, 'throws with null in right')
  t.throws(fj(unit, undefined), righterr, 'throws with undefined in right')
  t.throws(fj(unit, 0), righterr, 'throws with falsey number in right')
  t.throws(fj(unit, 1), righterr, 'throws with truthy number in right')
  t.throws(fj(unit, ''), righterr, 'throws with falsey string in right')
  t.throws(fj(unit, 'string'), righterr, 'throws with truthy string in right')
  t.throws(fj(unit, false), righterr, 'throws with false in right')
  t.throws(fj(unit, true), righterr, 'throws with true in right')
  t.throws(fj(unit, {}), righterr, 'throws with object in right')
  t.throws(fj(unit, []), righterr, 'throws with array in right')

  const nothing = Maybe.Nothing()
  const just = Maybe.Just(11)

  t.equal(nothing.either(R.always('nothing'), R.always('something')), 'nothing', 'returns left function result when called on Nothing')
  t.equal(just.either(R.always('nothing'), R.always('something')), 'something', 'returns right function result when called on Somthing')
  t.equal(just.either(R.always('nothing'), x => x*2), 22, 'returns right function applied to the just value when called on Something')

  t.end()
})

test('Maybe stand-alone either', t => {
  const fn = bindFunc((l, r) => either(l, r)(Maybe.Nothing()))
  const fj = bindFunc((l, r) => either(l, r)(Maybe.Just(23)))
  const fnu = bindFunc((l, r) => eitherU(l, r, Maybe.Nothing()))
  const fju = bindFunc((l, r) => eitherU(l, r, Maybe.Just(23)))

  const err = /left is not a function/
  const righterr = /right is not a function/

  t.throws(fn(), err, 'throws when nothing passed')
  t.throws(fn(null, unit), err, 'throws with null in left')
  t.throws(fn(undefined, unit), err, 'throws with undefined in left')
  t.throws(fn(0, unit), err, 'throws with falsey number in left')
  t.throws(fn(1, unit), err, 'throws with truthy number in left')
  t.throws(fn('', unit), err, 'throws with falsey string in left')
  t.throws(fn('string', unit), err, 'throws with truthy string in left')
  t.throws(fn(false, unit), err, 'throws with false in left')
  t.throws(fn(true, unit), err, 'throws with true in left')
  t.throws(fn({}, unit), err, 'throws with object in left')
  t.throws(fn([], unit), err, 'throws with array in left')

  t.throws(fnu(), err, 'throws when nothing passed')
  t.throws(fnu(null, unit), err, 'throws with null in left')
  t.throws(fnu(undefined, unit), err, 'throws with undefined in left')
  t.throws(fnu(0, unit), err, 'throws with falsey number in left')
  t.throws(fnu(1, unit), err, 'throws with truthy number in left')
  t.throws(fnu('', unit), err, 'throws with falsey string in left')
  t.throws(fnu('string', unit), err, 'throws with truthy string in left')
  t.throws(fnu(false, unit), err, 'throws with false in left')
  t.throws(fnu(true, unit), err, 'throws with true in left')
  t.throws(fnu({}, unit), err, 'throws with object in left')
  t.throws(fnu([], unit), err, 'throws with array in left')

  t.throws(fj(unit, null), righterr, 'throws with null in right')
  t.throws(fj(unit, undefined), righterr, 'throws with undefined in right')
  t.throws(fj(unit, 0), righterr, 'throws with falsey number in right')
  t.throws(fj(unit, 1), righterr, 'throws with truthy number in right')
  t.throws(fj(unit, ''), righterr, 'throws with falsey string in right')
  t.throws(fj(unit, 'string'), righterr, 'throws with truthy string in right')
  t.throws(fj(unit, false), righterr, 'throws with false in right')
  t.throws(fj(unit, true), righterr, 'throws with true in right')
  t.throws(fj(unit, {}), righterr, 'throws with object in right')
  t.throws(fj(unit, []), righterr, 'throws with array in right')

  t.throws(fju(unit, null), righterr, 'throws with null in right')
  t.throws(fju(unit, undefined), righterr, 'throws with undefined in right')
  t.throws(fju(unit, 0), righterr, 'throws with falsey number in right')
  t.throws(fju(unit, 1), righterr, 'throws with truthy number in right')
  t.throws(fju(unit, ''), righterr, 'throws with falsey string in right')
  t.throws(fju(unit, 'string'), righterr, 'throws with truthy string in right')
  t.throws(fju(unit, false), righterr, 'throws with false in right')
  t.throws(fju(unit, true), righterr, 'throws with true in right')
  t.throws(fju(unit, {}), righterr, 'throws with object in right')
  t.throws(fju(unit, []), righterr, 'throws with array in right')

  const nothing = Maybe.Nothing()
  const just = Maybe.Just(11)

  const chooser = either(R.always('nothing'), R.always('something'))
  const doubleChooser = either(R.always('nothing'), x => x*2)

  t.equal(chooser(nothing), 'nothing', 'returns left function result when called on Nothing')
  t.equal(chooser(just), 'something', 'returns right function result when called on Somthing')
  t.equal(doubleChooser(just), 22, 'returns right function applied to the just value when called on Something')

  const chooserU = m => eitherU(R.always('nothing'), R.always('something'), m)
  const doubleChooserU = m => eitherU(R.always('nothing'), x => x*2, m)

  t.equal(chooserU(nothing), 'nothing', 'returns left function result when called on Nothing')
  t.equal(chooserU(just), 'something', 'returns right function result when called on Somthing')
  t.equal(doubleChooserU(just), 22, 'returns right function applied to the just value when called on Something')

  t.end()
})

test('Maybe either demo', t => {
  const j = Maybe.of('the quick brown fox')
  const n = Maybe.Nothing()

  const left = R.always([])
  const right = R.split(' ')

  t.deepEqual(j.either(left, right), [ 'the', 'quick', 'brown', 'fox' ], 'either split right')
  t.deepEqual(n.either(left, right), [], 'either split left')

  t.end()
})

test('Maybe stand-alone either demo', t => {
  const j = Maybe.of('the quick brown fox')
  const n = Maybe.Nothing()

  const left = R.always([])
  const right = R.split(' ')

  const chooser = either(left, right)

  t.deepEqual(chooser(j), [ 'the', 'quick', 'brown', 'fox' ], 'either split right')
  t.deepEqual(chooser(n), [], 'either split left')

  t.deepEqual(eitherU(left, right, j), [ 'the', 'quick', 'brown', 'fox' ], 'either split right')
  t.deepEqual(eitherU(left, right, n), [], 'either split left')

  t.end()
})

test('Maybe empty', t => {
  const value = 'x'
  const a = Maybe.Just(value)

  t.ok(isFunction(a.empty), 'provides an empty function')
  t.equal(a.empty().toString(), 'Nothing', 'empty turns a just into nothing')

  t.end()
})

test('Maybe empty demo', t => {
  const j = Maybe.of('any value')
  const n = Maybe.Nothing()

  t.equal(j.empty().isNothing(), true, 'just to nothing')
  t.equal(n.empty().isNothing(), true, 'nothing to nothing')

  t.end()
})

test('Maybe equals functionality', t => {
  const a = Maybe.Just(0)
  const b = Maybe.Just(0)
  const c = Maybe.Just(1)

  const d = Maybe.Just(undefined)
  const n = Maybe.Nothing()

  const value = 0
  const nonMaybe = { type: 'Maybe...Not' }

  t.equal(a.equals(c), false, 'returns false when 2 Justs are not equal')
  t.equal(d.equals(n), false, 'returns false when Just(undefinded) and Nothing compared')
  t.equal(a.equals(value), false, 'returns false when passed a simple value')
  t.equal(a.equals(nonMaybe), false, 'returns false when passed a non-Maybe')

  t.equal(a.equals(b), true, 'returns true when 2 Justs are equal')
  t.equal(n.equals(Maybe.Nothing()), true, 'returns true when Nothings compared')

  t.end()
})

test('Maybe stand-alone equals functionality', t => {
  const a = Maybe.Just(0)
  const b = Maybe.Just(0)
  const c = Maybe.Just(1)

  const d = Maybe.Just(undefined)
  const n = Maybe.Nothing()

  const value = 0
  const nonMaybe = { type: 'Maybe...Not' }

  t.equal(equals(a)(c), false, 'returns false when 2 Justs are not equal')
  t.equal(equals(d)(n), false, 'returns false when Just(undefinded) and Nothing compared')
  t.equal(equals(a)(value), false, 'returns false when passed a simple value')
  t.equal(equals(a)(nonMaybe), false, 'returns false when passed a non-Maybe')

  t.equal(equals(a)(b), true, 'returns true when 2 Justs are equal')
  t.equal(equals(n)(Maybe.Nothing()), true, 'returns true when Nothings compared')

  t.equal(equalsU(a, c), false, 'returns false when 2 Justs are not equal')
  t.equal(equalsU(d, n), false, 'returns false when Just(undefinded) and Nothing compared')
  t.equal(equalsU(a, value), false, 'returns false when passed a simple value')
  t.equal(equalsU(a, nonMaybe), false, 'returns false when passed a non-Maybe')

  t.equal(equalsU(a, b), true, 'returns true when 2 Justs are equal')
  t.equal(equalsU(n, Maybe.Nothing()), true, 'returns true when Nothings compared')

  t.end()
})

test('Maybe equals demo', t => {
  const a = Maybe.of(42)
  const b = Maybe.of(6).map(x => x * 7)
  const c = Maybe.Nothing()

  t.equal(a.equals(b), true, 'equality returns true')
  t.equal(a.equals(c), false, 'equality with nothing is false')
  t.equal(c.equals(b), false, 'equality from nothing is false')
  t.equal(c.equals(Maybe.Nothing()), true, 'nothing equals nothing')

  t.end()
})

test('Maybe stand-alone equals demo', t => {
  const a = Maybe.of(42)
  const b = Maybe.of(6).map(x => x * 7)
  const c = Maybe.Nothing()

  const equalsA = equals(a)
  const equalsC = equals(c)

  t.equal(equalsA(b), true, 'equality returns true')
  t.equal(equalsA(c), false, 'equality with nothing is false')
  t.equal(equalsC(b), false, 'equality from nothing is false')
  t.equal(equalsC(Maybe.Nothing()), true, 'nothing equals nothing')

  t.equal(equalsU(a, b), true, 'equality returns true')
  t.equal(equalsU(a, c), false, 'equality with nothing is false')
  t.equal(equalsU(c, b), false, 'equality from nothing is false')
  t.equal(equalsU(c, Maybe.Nothing()), true, 'nothing equals nothing')

  t.end()
})

test('Maybe is function', t => {
  const a = Maybe.Just([ 1,2 ])
  const b = Maybe.Just({ a: 1 })
  const c = Maybe.Just(() => ({}))
  const d = Maybe.Just(undefined)
  const e = Maybe.Just(13)
  const f = Maybe.Just('xyz')
  const g = Maybe.of(true)
  const nothing = Maybe.Nothing()

  t.ok(isFunction(a.is), 'provides an is function')
  t.equal(a.is(Array), true, 'tests for array type')
  t.equal(a.is(Object), false, 'does not call array an object')
  t.equal(b.is(Object), true, 'tests for object type')
  t.equal(c.is(Function), true, 'tests for function type')
  t.equal(c.is(Object), false, 'a function is not considered an object')
  t.equal(d.is(Object), false, 'undefined does not match')
  t.equal(e.is(Number), true, 'tests for number type')
  t.equal(f.is(String), true, 'tests for string type')
  t.equal(f.is(Object), false, 'strings are not objects')
  t.equal(g.is(Boolean), true, 'tests for boolean type')
  t.equal(nothing.is(Object), false, 'nothing fails all tests')

  t.end()
})

test('Maybe stand-alone is function', t => {
  const a = Maybe.Just([ 1,2 ])
  const b = Maybe.Just({ a: 1 })
  const c = Maybe.Just(() => ({}))
  const d = Maybe.Just(undefined)
  const e = Maybe.Just(13)
  const f = Maybe.Just('xyz')
  const g = Maybe.of(true)
  const nothing = Maybe.Nothing()

  t.ok(isFunction(is), 'provides an is function')
  t.ok(isFunction(isU), 'provides an is function')

  t.equal(is(Array)(a), true, 'tests for array type')
  t.equal(is(Object)(a), false, 'does not call array an object')
  t.equal(is(Object)(b), true, 'tests for object type')
  t.equal(is(Function)(c), true, 'tests for function type')
  t.equal(is(Object)(c), false, 'a function is not considered an object')
  t.equal(is(Object)(d), false, 'undefined does not match')
  t.equal(is(Number)(e), true, 'tests for number type')
  t.equal(is(String)(f), true, 'tests for string type')
  t.equal(is(Object)(f), false, 'strings are not objects')
  t.equal(is(Boolean)(g), true, 'tests for boolean type')
  t.equal(is(Object)(nothing), false, 'nothing fails all tests')

  t.equal(isU(Array, a), true, 'tests for array type')
  t.equal(isU(Object, a), false, 'does not call array an object')
  t.equal(isU(Object, b), true, 'tests for object type')
  t.equal(isU(Function, c), true, 'tests for function type')
  t.equal(isU(Object, c), false, 'a function is not considered an object')
  t.equal(isU(Object, d), false, 'undefined does not match')
  t.equal(isU(Number, e), true, 'tests for number type')
  t.equal(isU(String, f), true, 'tests for string type')
  t.equal(isU(Object, f), false, 'strings are not objects')
  t.equal(isU(Boolean, g), true, 'tests for boolean type')
  t.equal(isU(Object, nothing), false, 'nothing fails all tests')

  t.end()
})

test('Maybe is demo', t => {
  t.equal(Maybe.of('a string').is(String), true, 'a string is a String')
  t.equal(Maybe.of(13).is(Number), true, 'a number is a Number')
  t.equal(Maybe.of(true).is(Number), false, 'a boolean is not a Number')
  t.equal(Maybe.of({ a: 1 }).is(Object), true, 'an object is an Object')
  t.equal(Maybe.of([ 1, 2, 3 ]).is(Array), true, 'an array is an Array')
  t.equal(Maybe.of(x => x).is(Function), true, 'a function is a Function')
  t.equal(Maybe.of(new Date()).is(Date), true, 'a date is a Date')
  t.equal(Maybe.of(new Date()).is(Object), false, 'a date is not an Object')
  t.equal(Maybe.of(undefined).is(Function), false, 'undefined is not a Function')
  t.equal(Maybe.Nothing().is(Object), false, 'nothing is not an Object')

  t.end()
})

test('Maybe stand-alone is demo', t => {
  t.equal(is(String)(Maybe.of('a string')), true, 'a string is a String')
  t.equal(is(Number)(Maybe.of(13)), true, 'a number is a Number')
  t.equal(is(Number)(Maybe.of(true)), false, 'a boolean is not a Number')
  t.equal(is(Object)(Maybe.of({ a: 1 })), true, 'an object is an Object')
  t.equal(is(Array)(Maybe.of([ 1, 2, 3 ])), true, 'an array is an Array')
  t.equal(is(Function)(Maybe.of(x => x)), true, 'a function is a Function')
  t.equal(is(Date)(Maybe.of(new Date())), true, 'a date is a Date')
  t.equal(is(Object)(Maybe.of(new Date())), false, 'a date is not an Object')
  t.equal(is(Function)(Maybe.of(undefined)), false, 'undefined is not a Function')
  t.equal(is(Object)(Maybe.Nothing()), false, 'nothing is not an Object')

  t.equal(isU(String, Maybe.of('a string')), true, 'a string is a String')
  t.equal(isU(Number, Maybe.of(13)), true, 'a number is a Number')
  t.equal(isU(Number, Maybe.of(true)), false, 'a boolean is not a Number')
  t.equal(isU(Object, Maybe.of({ a: 1 })), true, 'an object is an Object')
  t.equal(isU(Array, Maybe.of([ 1, 2, 3 ])), true, 'an array is an Array')
  t.equal(isU(Function, Maybe.of(x => x)), true, 'a function is a Function')
  t.equal(isU(Date, Maybe.of(new Date())), true, 'a date is a Date')
  t.equal(isU(Object, Maybe.of(new Date())), false, 'a date is not an Object')
  t.equal(isU(Function, Maybe.of(undefined)), false, 'undefined is not a Function')
  t.equal(isU(Object, Maybe.Nothing()), false, 'nothing is not an Object')

  t.end()
})

test('Maybe isJust', t => {
  const j = Maybe.Just('a just')
  const n = Maybe.Nothing()

  t.equal(j.isJust(), true, 'isJust is true for Justs')
  t.equal(n.isJust(), false, 'isJust is false for Nothings')

  t.end()
})

test('Maybe stand-alone isJust', t => {
  const j = Maybe.Just('a just')
  const n = Maybe.Nothing()

  t.equal(isJust(j), true, 'isJust is true for Justs')
  t.equal(isJust(n), false, 'isJust is false for Nothings')

  t.end()
})

test('Maybe isNothing', t => {
  const j = Maybe.Just('a just')
  const n = Maybe.Nothing()

  t.equal(n.isNothing(), true, 'isNothing is true for Nothings')
  t.equal(j.isNothing(), false, 'isNothing is false for Justs')

  t.end()
})

test('Maybe stand-alone isNothing', t => {
  const j = Maybe.Just('a just')
  const n = Maybe.Nothing()

  t.equal(isNothing(n), true, 'isNothing is true for Nothings')
  t.equal(isNothing(j), false, 'isNothing is false for Justs')

  t.end()
})

test('Maybe map errors', t => {
  const m = { type: () => 'Maybe...Not' }
  const map = bindFunc(Maybe.Just(0).map)

  const err = /f is not a function/
  t.throws(map(undefined), err, 'throws with undefined')
  t.throws(map(null), err, 'throws with null')
  t.throws(map(0), err, 'throws with falsey number')
  t.throws(map(1), err, 'throws with truthy number')
  t.throws(map(''), err, 'throws with falsey string')
  t.throws(map('string'), err, 'throws with truthy string')
  t.throws(map(false), err, 'throws with false')
  t.throws(map(true), err, 'throws with true')
  t.throws(map([]), err, 'throws with an array')
  t.throws(map({}), err, 'throws with object')
  t.throws(map(m), err, 'throws with non-Maybe')

  t.doesNotThrow(map(unit), 'allows a function')

  t.end()
})

test('Maybe stand-alone map errors', t => {
  const m = { type: () => 'Fake Maybe' }
  const mapTest = bindFunc(f => map(f)(Maybe.Just(0)))

  const err = /f is not a function/
  t.throws(mapTest(undefined), err, 'throws with undefined')
  t.throws(mapTest(null), err, 'throws with null')
  t.throws(mapTest(0), err, 'throws with falsey number')
  t.throws(mapTest(1), err, 'throws with truthy number')
  t.throws(mapTest(''), err, 'throws with falsey string')
  t.throws(mapTest('string'), err, 'throws with truthy string')
  t.throws(mapTest(false), err, 'throws with false')
  t.throws(mapTest(true), err, 'throws with true')
  t.throws(mapTest([]), err, 'throws with an array')
  t.throws(mapTest({}), err, 'throws with object')
  t.throws(mapTest(m), err, 'throws with non-Maybe')

  t.doesNotThrow(mapTest(unit), 'allows a function')

  const mapUTest = bindFunc(f => mapU(f, Maybe.Just(0)))

  t.throws(mapUTest(undefined), err, 'throws with undefined')
  t.throws(mapUTest(null), err, 'throws with null')
  t.throws(mapUTest(0), err, 'throws with falsey number')
  t.throws(mapUTest(1), err, 'throws with truthy number')
  t.throws(mapUTest(''), err, 'throws with falsey string')
  t.throws(mapUTest('string'), err, 'throws with truthy string')
  t.throws(mapUTest(false), err, 'throws with false')
  t.throws(mapUTest(true), err, 'throws with true')
  t.throws(mapUTest([]), err, 'throws with an array')
  t.throws(mapUTest({}), err, 'throws with object')
  t.throws(mapUTest(m), err, 'throws with non-Maybe')

  t.doesNotThrow(mapUTest(unit), 'allows a function')

  t.end()
})

test('Maybe map fantasy-land errors', t => {
  const m = { type: () => 'Maybe...Not' }
  const map = bindFunc(Maybe.Just(0)[fantasyLand.map])

  const err = /f is not a function/
  t.throws(map(undefined), err, 'throws with undefined')
  t.throws(map(null), err, 'throws with null')
  t.throws(map(0), err, 'throws with falsey number')
  t.throws(map(1), err, 'throws with truthy number')
  t.throws(map(''), err, 'throws with falsey string')
  t.throws(map('string'), err, 'throws with truthy string')
  t.throws(map(false), err, 'throws with false')
  t.throws(map(true), err, 'throws with true')
  t.throws(map([]), err, 'throws with an array')
  t.throws(map({}), err, 'throws with object')
  t.throws(map(m), err, 'throws with non-Maybe')

  t.doesNotThrow(map(unit), 'allows a function')

  t.end()
})

test('Maybe map functionality', t => {
  const spy = sinon.spy(R.identity)

  t.equal(Maybe.Just('Just').map(R.identity).valueOr('Nothing'), 'Just', 'Just returns a Just')
  t.equal(Maybe.Nothing().map(R.identity).valueOr('Nothing'), 'Nothing', 'Nothing returns a Nothing')

  const nothing = Maybe.Nothing().map(spy)

  t.equal(nothing.valueOr('Nothing'), 'Nothing', 'returns a Nothing when mapping a Nothing')
  t.equal(spy.called, false, 'mapping function is never called on Nothing')

  const def = Maybe.Just('Just').map(spy)

  t.equal(def.valueOr('Nothing'), 'Just', 'returns a Just')
  t.equal(def.valueOr('Nothing'), 'Just', 'returns a Just with the same value when mapped with identity')
  t.equal(spy.called, true, 'mapped function is called on Just')

  const arr = [ 1, 3, 6, 8 ]
  const arrmap = x => x * 10
  const arrexpected = [ 10, 30, 60, 80 ]

  t.same(Maybe.Just(arr).map(arrmap).valueOr([]), arrexpected, 'array mapping')

  const obj = { a: 'a', b: 'b', c: 'c' }
  const objexpected = { a: 'A', b: 'B', c: 'C' }

  t.same(Maybe.of(obj).map(R.toUpper).valueOr({}), objexpected, 'object mapping')

  t.end()
})

test('Maybe stand-alone map functionality', t => {
  const spy = sinon.spy(R.identity)

  const mapId = map(R.identity)
  const checkValue = valueOr('Nothing')
  const valueOfMapId = R.compose(checkValue, mapId)

  t.equal(valueOfMapId(Maybe.Just('Just')), 'Just', 'standalone Just returns a Just')
  t.equal(valueOfMapId(Maybe.Nothing()), 'Nothing', 'standalone Nothing returns a Nothing')

  t.equal(checkValue(mapU(R.identity, Maybe.Just('Just'))), 'Just', 'uncurried Just returns a Just')
  t.equal(checkValue(mapU(R.identity, Maybe.Nothing())), 'Nothing', 'uncurried Nothing returns a Nothing')

  const nothing = map(spy)(Maybe.Nothing())

  spy.resetHistory()
  t.equal(checkValue(nothing), 'Nothing', 'standalone returns a Nothing when mapping a Nothing')
  t.equal(spy.called, false, 'standalone mapping function is never called on Nothing')

  const nothingU = mapU(spy, Maybe.Nothing())

  spy.resetHistory()
  t.equal(checkValue(nothingU), 'Nothing', 'uncurried returns a Nothing when mapping a Nothing')
  t.equal(spy.called, false, 'uncurried mapping function is never called on Nothing')

  spy.resetHistory()
  const def = map(spy)(Maybe.Just('Just'))

  t.equal(checkValue(def), 'Just', 'standalone returns a Just')
  t.equal(checkValue(def), 'Just', 'standalone returns a Just with the same value when mapped with identity')
  t.equal(spy.called, true, 'standalone mapped function is called on Just')

  spy.resetHistory()
  const defU = mapU(spy, Maybe.Just('Just'))

  t.equal(checkValue(defU), 'Just', 'uncurried returns a Just')
  t.equal(checkValue(defU), 'Just', 'uncurried returns a Just with the same value when mapped with identity')
  t.equal(spy.called, true, 'uncurried mapped function is called on Just')

  const arr = [ 1, 3, 6, 8 ]
  const arrmap = x => x * 10
  const arrexpected = [ 10, 30, 60, 80 ]

  const mapBy10 = map(arrmap)
  const valueOrEmpty = valueOr([])
  const checkMapBy10 = R.compose(valueOrEmpty, mapBy10)

  t.same(checkMapBy10(Maybe.Just(arr)), arrexpected, 'standalone array mapping')
  t.same(valueOrEmpty(mapU(arrmap, Maybe.Just(arr))), arrexpected, 'uncurried array mapping')

  const obj = { a: 'a', b: 'b', c: 'c' }
  const objexpected = { a: 'A', b: 'B', c: 'C' }

  const mapToUpper = map(R.toUpper)
  const valueOrEmptyObject = valueOr({})
  const checkMapToUpper = R.compose(valueOrEmptyObject, mapToUpper)

  t.same(checkMapToUpper(Maybe.of(obj)), objexpected, 'standalone object mapping')
  t.same(valueOrEmptyObject(mapU(R.toUpper, Maybe.of(obj))), objexpected, 'uncurried object mapping')

  t.end()
})

test('Maybe map as ap', t => {
  const divBySix = x => x / 6
  const a = Maybe.of(42)

  t.equal(a.map(divBySix).value, 7, 'changes map function to ap when needed')

  t.end()
})

test('Maybe stand-alone map as ap', t => {
  const divBySix = x => x / 6
  const a = Maybe.of(42)

  const mapDivSix = map(divBySix)

  t.equal(mapDivSix(a).value, 7, 'changes map function to ap when needed')
  t.equal(mapU(divBySix, a).value, 7, 'changes map function to ap when needed')

  t.end()
})

test('Maybe map demo', t => {
  const a = Maybe.of([ 1, 2, 3, 4 ])
  const b = Maybe.of({ a: 'Thanks', b: 'for', c: 'all', d: 'the', e: 'fish' })
  const c = Maybe.of(99)
  const n = Maybe.Nothing()
  const nothingValue = '_NOTHING_VALUE_'

  t.deepEqual(a.map(R.multiply(3)).valueOr(nothingValue), [ 3, 6, 9, 12 ], 'mapping an array')
  t.deepEqual(b.map(R.toUpper).valueOr(nothingValue), { a: 'THANKS', b: 'FOR', c: 'ALL', d: 'THE', e: 'FISH' }, 'mapping an object')
  t.equal(c.map(x => x % 9 === 0).valueOr(nothingValue), true, 'mapping a single value' )
  t.equal(n.map(R.toUpper).valueOr(nothingValue), nothingValue, 'mapping a nothing')

  t.end()
})

test('Maybe stand-alone map demo', t => {
  const a = Maybe.of([ 1, 2, 3, 4 ])
  const b = Maybe.of({ a: 'Thanks', b: 'for', c: 'all', d: 'the', e: 'fish' })
  const c = Maybe.of(99)
  const n = Maybe.Nothing()
  const nothingValue = '_NOTHING_VALUE_'
  const checker = valueOr(nothingValue)

  const tripleIt = map(R.multiply(3))
  const upIt = map(R.toUpper)
  const isMultipleOf9 = map(x => x % 9 === 0)

  t.deepEqual(checker(tripleIt(a)), [ 3, 6, 9, 12 ], 'mapping an array')
  t.deepEqual(checker(upIt(b)), { a: 'THANKS', b: 'FOR', c: 'ALL', d: 'THE', e: 'FISH' }, 'mapping an object')
  t.equal(checker(isMultipleOf9(c)), true, 'mapping a single value' )
  t.equal(checker(upIt(n)), nothingValue, 'mapping a nothing')

  t.deepEqual(checker(mapU(R.multiply(3), a)), [ 3, 6, 9, 12 ], 'mapping an array')
  t.deepEqual(checker(mapU(R.toUpper, b)),
    { a: 'THANKS', b: 'FOR', c: 'ALL', d: 'THE', e: 'FISH' }, 'mapping an object')
  t.equal(checker(mapU(x => x % 9 === 0, c)), true, 'mapping a single value' )
  t.equal(checker(mapU(R.toUpper, n)), nothingValue, 'mapping a nothing')

  t.end()
})

test('Maybe of', t => {
  t.equal(Maybe.of, Maybe(0).of, 'Maybe.of is the same as the instance version')
  t.equal(Maybe.of(0).type(), '13d-io/Maybe', 'returns a Maybe')
  t.equal(Maybe.of(0).valueOr('Nothing'), 0, 'wraps the value passed into a Maybe')

  t.end()
})

test('Maybe safeOf excludes nil from Just', t => {
  const a = Maybe.safeOf(null)
  const b = Maybe.safeOf(undefined)
  const c = Maybe.safeOf([])
  const d = Maybe.safeOf('')
  const e = Maybe.safeOf({})
  const f = Maybe.safeOf(0)
  const g = Maybe.safeOf(false)

  t.equal(a.isNothing(), true, 'null goes to nothing')
  t.equal(b.isNothing(), true, 'undefined goes to nothing')
  t.equal(c.isNothing(), false, 'empty array is safe')
  t.equal(d.isNothing(), false, 'empty string is safe')
  t.equal(e.isNothing(), false, 'empty object is is safe')
  t.equal(f.isNothing(), false, 'zero is safe')
  t.equal(g.isNothing(), false, 'false is safe')

  t.end()
})

test('Maybe test', t => {

  const a = Maybe.Just([ 1, 2 ])
  const b = Maybe.Just(42)
  const c = Maybe.Just(null)

  t.equal(a.test(Maybe.Nothing().toString(), a.type, [ Array ]), 'Nothing', 'Failing the array exclusion returns the left')
  t.equal(b.test(Maybe.Nothing(), b.type, [ Array ]), '13d-io/Maybe', 'Passing the array exclusion returns the right')
  t.equal(b.test(Maybe.Nothing().toString(), b.type, [ Number ], [ 'concat' ]), 'Nothing', 'Failing the implementation test returns the left')
  t.equal(a.test(Maybe.Nothing(), a.type, [ Array ], [ 'concat' ]), '13d-io/Maybe', 'Passing the implementation test returns the right')
  t.equal(c.test(Maybe.Nothing().toString(), c.type), 'Nothing', 'Failing the nil test returns the left')
  t.end()
})

test('Maybe toJust', t => {
  const value = 'abc'
  const a = Maybe.Nothing()

  t.ok(isFunction(a.toJust), 'provides a toJust function')
  t.equal(a.toJust(value).value, value, 'toJust turns a nothing into a just')

  t.end()
})

test('Maybe toString', t => {
  const m = Maybe.Just('great')
  const n = Maybe.Nothing()

  t.ok(isFunction(m.toString), 'Just provides a toString function')
  t.ok(isFunction(n.toString), 'Nothing provides a toString function')

  t.equal(m.toString(), 'Just "great"', 'returns toString string')
  t.equal(n.toString(), 'Nothing', 'Nothing returns toString string')

  t.end()
})

test('Maybe toString functionality', t => {

  const a = Maybe.Just([ 1,2 ])
  const b = Maybe.Just({ a: 1 })
  const c = Maybe.Just(() => ({}))
  const d = Maybe.Just(undefined)
  const nothing = Maybe.Nothing()
  const c$ = c.toString()

  t.equal(a.toString(), 'Just [1,2]', 'Just containing an array is pretty printed')
  t.equal(b.toString(), 'Just {"a":1}', 'Just containing an object is pretty printed')
  t.equal(c$.search('Just '), 0, 'Just containing a function is pretty printed')
  t.ok(c$.search('({})') > 0, 'Function contensts are kinda pretty printed')
  t.equal(d.toString(), 'Just undefined', 'Just containing undefined is pretty printed')
  t.equal(nothing.toString(), 'Nothing', 'Nothing is pretty printed')

  t.end()
})

test('Maybe type', t => {
  const { Just, Nothing } = Maybe

  t.ok(isFunction(Maybe(0).type), 'is a function')

  t.equal(Just(0).type, Maybe.type, 'stand-alone and instance versions are the same for Just')
  t.equal(Nothing(0).type, Maybe.type, 'stand-alone and instance versions are the same for Nothing')

  t.equal(Just(0).type(), '13d-io/Maybe', 'type returns 13d-io/Maybe for Just')
  t.equal(Nothing().type(), '13d-io/Maybe', 'type returns 13d-io/Maybe for Nothing')

  t.end()
})

test('Maybe valueOr', t => {
  const nothing = Maybe.Nothing()
  const just = Maybe.Just('something')

  t.equal(nothing.valueOr('was nothing'), 'was nothing', 'returns passed value when called on Nothing')
  t.equal(just.valueOr('was something'), 'something', 'returns wrapped value when called on Something')

  t.end()
})

test('Maybe valueOr demo', t => {
  const j = Maybe.of('selected option')
  const n = Maybe.Nothing()
  const defaultValue = 'default option'

  t.equal(j.valueOr(defaultValue), 'selected option', 'just returns its value')
  t.equal(n.valueOr(defaultValue), 'default option', 'nothing returns the specified value')

  t.end()
})

test('Alt spec tests', t => {
  const a = Maybe.of('a')
  const b = Maybe.Nothing()
  const c = Maybe.of('c')

  const f = either(R.always('nothing'), R.identity)

  t.equals(f(a.alt(b).alt(c)), f(a.alt(b.alt(c))), 'assosiativity')

  t.equals(
    f(a.alt(b).map(R.identity)),
    f(a.map(R.identity).alt(b.map(R.identity))),
    'distributivity'
  )

  t.end()
})

test('Alternative spec tests', t => {
  const x = Maybe.of(11)
  const f = Maybe.of(R.identity)
  const g = Maybe.of(R.multiply(12))
  const n = Maybe.Nothing()
  const nothingValue = -1

  t.test(x.ap(f.alt(g)).valueOr(nothingValue), x.ap(f).alt(x.ap(g)).valueOr(nothingValue), 'distributivity')
  t.test(x.ap(n.alt(g)).valueOr(nothingValue), x.ap(n).alt(x.ap(g)).valueOr(nothingValue), 'distributivity')
  t.test(x.ap(Maybe.zero()).valueOr(nothingValue), Maybe.zero().valueOr(nothingValue), 'annihilation')

  t.end()
})

test('Applicative spec tests', t => {
  const m = Maybe.Just(R.identity)
  const j = Maybe.Just(3)

  t.ok(isFunction(j.of), 'Just provides an of function')
  t.ok(isFunction(j.ap), 'Just implements the Apply spec')

  t.equal(m.ap(j).valueOr('Nothing'), 3, 'identity')
  t.equal(
    m.ap(Maybe.of(3)).valueOr('Nothing'),
    Maybe.of(R.identity(3)).valueOr('Nothing'),
    'homomorphism'
  )

  const a = x => m.ap(Maybe.of(x))
  const b = x => Maybe.of(R.applyTo(x)).ap(m)

  t.equal(a(3).valueOr('Nothing'), b(3).valueOr('Other'), 'interchange Just')
  t.equal(j.ap(m).toString(), 'Just 3', 'Value applying the function works')
  t.equal(m.ap(j).toString(), 'Just 3', 'Function applying the value works too')
  t.equal(j.ap(j).toString(), 'Nothing', 'Value applying itself is nothing')

  t.end()
})

test('Apply spec tests', t => {
  const m = Maybe.Just(R.identity)

  const a = m.map(R.compose).ap(m).ap(m)
  const b = m.ap(m.ap(m))

  const j = Maybe.Just(3)
  const n = Maybe.Nothing()

  t.ok(isFunction(j.ap), 'Just provides an ap function')
  t.ok(isFunction(j.map), 'Just implements the Functor spec')

  t.ok(isFunction(n.ap), 'Nothing provides an ap function')
  t.ok(isFunction(n.map), 'Nothing implements the Functor spec')

  t.equal(a.ap(j).valueOr('Nothing'), b.ap(j).valueOr('Nothing'), 'composition Just')
  t.equal(a.ap(n).valueOr('Nothing'), b.ap(n).valueOr('Nothing'), 'composition Nothing')

  t.end()
})

test('Chain spec tests', t => {
  const j = Maybe.Just(0)
  const n = Maybe.Nothing()

  t.ok(isFunction(j.chain), 'Just provides a chain function')
  t.ok(isFunction(j.ap), 'Just implements the Apply spec')

  t.ok(isFunction(n.chain), 'Nothing provides a chain function')
  t.ok(isFunction(n.ap), 'Nothing implements the Apply spec')

  const f = x => Maybe.of(x + 2)
  const g = x => Maybe.of(x + 10)

  const a = x => Maybe.of(x).chain(f).chain(g)
  const b = x => Maybe.of(x).chain(y => f(y).chain(g))

  t.equal(a(10).valueOr('Nothing'), b(10).valueOr('Other'), 'assosiativity')

  t.end()
})

test('Functor spec tests', t => {
  const f = x => x + 2
  const g = x => x * 2

  t.ok(isFunction(Maybe.Just(0).map), 'Just provides a map function')
  t.ok(isFunction(Maybe.Nothing().map), 'Just provides a map function')

  t.equal(Maybe.Just(null).map(R.identity).valueOr('Nothing'), 'Nothing', 'identity')
  t.equal(
    Maybe.Just(10).map(x => f(g(x))).valueOr('Nothing'),
    Maybe(10).map(g).map(f).valueOr('Other'),
    'composition'
  )

  t.end()
})

test('Monad spec tests', t => {
  t.ok(isFunction(Maybe(0).chain), 'implements the Chain spec')
  t.ok(isFunction(Maybe(0).of), 'implements the Applicative spec')

  const f = Maybe.of

  t.equal(Maybe.of(3).chain(f).valueOr('First'), f(3).valueOr('Second'), 'left identity')
  t.equal(f(3).chain(Maybe.of).valueOr('First'), f(3).valueOr('Second'), 'right identity')

  t.end()
})

test('Monoid spec tests', t => {
  const a = Maybe.of('a')
  const nothingValue = '_NOTHING_VALUE_'

  t.equals(a.concat(Maybe.empty()).valueOr(nothingValue), a.valueOr(nothingValue),
    'right identity')
  t.equals(Maybe.empty().concat(a).valueOr(nothingValue), a.valueOr(nothingValue),
    'left identity')

  t.end()
})

test('Plus spec tests', t => {
  const a = Maybe.of('a')

  const f = either(R.always('nothing'), R.identity)

  t.equals(f(a.alt(Maybe.zero())), f(a), 'right identity')
  t.equals(f(Maybe.zero().alt(a)), f(a), 'left identity')
  t.equals(f(Maybe.zero().map(R.identity)), f(Maybe.zero()), 'annihilation')

  t.end()
})

test('Semigroup spec tests', t => {
  const extract =
    either(R.always('Nothing'), R.identity)

  const a = Maybe.Just([ 'a' ])
  const b = Maybe.Just([ 'b' ])
  const c = Maybe.Just([ 'c' ])

  const left = a.concat(b).concat(c)
  const right = a.concat(b.concat(c))

  t.ok(isFunction(a.concat), 'provides a concat function')

  t.same(extract(left), extract(right), 'associativity')
  t.ok(isArray(extract(a.concat(b))), 'returns an Array')

  t.end()
})

test('Setoid spec tests', t => {
  const a = Maybe.Just([ 1, 'joe' ])
  const b = Maybe.Just([ 1, 'joe' ])
  const c = Maybe.Just([ 'joe', 1 ])
  const d = Maybe.Just([ 1, 'joe' ])

  t.ok(isFunction(Maybe.Just(0).equals), 'provides an equals function')

  t.equal(a.equals(a), true, 'reflexivity')
  t.equal(a.equals(b), b.equals(a), 'symmetry (equal)')
  t.equal(a.equals(c), c.equals(a), 'symmetry (!equal)')
  t.equal(a.equals(b) && b.equals(d), a.equals(d), 'transitivity')

  t.end()
})

