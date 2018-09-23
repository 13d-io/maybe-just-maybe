/**
 * @author Richard Vance <richiemillennium@gmail.com>
 * @copyright (c) 2018 Richard Vance.
 * @licence MIT
 */

const { equals, map, concat, is, isNil, type } = require('ramda')

const libType = '13d-io/Maybe'

const fantasyLand = {
  alt: 'fantasy-land/alt',
  chain: 'fantasy-land/chain',
  concat: 'fantasy-land/concat',
  empty: 'fantasy-land/empty',
  equals: 'fantasy-land/equals',
  map: 'fantasy-land/map',
  of: 'fantasy-land/of',
  zero: 'fantasy-land/zero'
}

const imps = [ 'alt', 'ap', 'chain', 'concat', 'equals', 'map', 'of', 'zero' ]

const _implements = test => !!imps.find(item => item === test)

const Just = value => Maybe(value, false)

const Nothing = () => Maybe(undefined, true)

const _safeOf = value =>
  _safe(value, Nothing(), Just)

const _evalAsyncOfPromise = (context, result) => {
  context.value = result
  context.nothing = !result
  context.promise = undefined
  Object.freeze(context)
  return context
}

const _asyncOf = p =>
  type(p) === 'Promise' ? Maybe(undefined, true, p) : Nothing()

const _empty = () => () => Nothing()

const _toJust = () => value => Just(value)

const _isNothing = context => () => context.nothing

const _isJust = context => () => !context.nothing

const _valueOr = context => defaultValue =>
  context.nothing ? defaultValue : context.value

const _evalAlt = (context, other) => () => {
  return context.nothing && !other.nothing && context.toJust(other.value) || context
}

const _alt = context => other =>
  _test(
    Nothing(), _evalAlt(context, other), other
  )

const _either = context => (left, right) =>
  context.nothing ? left() : right(context.value)

const _evalEquals = (context, other) => () =>
  context.nothing ? other.nothing : equals(other.value, context.value) && !other.nothing

const _equals = context => other =>
  _test(false, _evalEquals(context, other), other)

const CONCAT_IGNORE_TYPES = [ Number, Object, Boolean, Function ]

const _evalConcat = (context, other) =>
  Just(concat(context.value, other.value))

const _testTypeConcat = (context, other) => () =>
  type(context.value) === type(other.value) ? _evalConcat(context, other) : Nothing()

const _reverseTestConcat = (context, other) => () => _safe(
  other.value,
  isNil(other.value) ? Just(context.value) : Nothing(),
  _testTypeConcat(context, other),
  CONCAT_IGNORE_TYPES, [ 'concat' ]
)

const _testConcat = (context, other) => () => _safe(
  context.value,
  isNil(context.value) ? Just(other.value) : Nothing(),
  _reverseTestConcat(context, other),
  CONCAT_IGNORE_TYPES, [ 'concat' ]
)

const _concat = context => other =>
  _test(Nothing(), _testConcat(context, other), other)

const _evalMap = (f, context) => () =>
  Just(map(f, context.value))

const _changeMapToAp = (f, context) => () =>
  Just(f(context.value))

const _testMapToAp = (f, context) => _safe(
  context.value, Nothing(), _changeMapToAp(f, context)
)

const _map = context => f =>
  _safe(
    context.value,
    () => _testMapToAp(f, context),
    () => _evalMap(f, context),
    [ Number, String, Boolean ],
    [ 'map' ]
  )()

const _evalAp = (f, context) => context.nothing ? Nothing() : Just(f(context.value))

const _testApContext = (context, other) =>
  typeof context.value === 'function' && _evalAp(context.value, other)

const _testAp = (context, other) => () => {
  return _testApContext(context, other)
    || _testApContext(other, context)
    || Nothing()
}

const _ap = context => other =>
  _test(Nothing(), _testAp(context, other), other)

const _evalChain = (f, context) => () => {
  const res = f(context.value)
  return _test(Nothing(), () => res, res)
}

const _chain = context => f =>
  _safe(
    context.value, Nothing(), _evalChain(f, context)
  )

const _json = value => {
  if (typeof value === 'function') {
    return value
  }
  const result = JSON.stringify(value)
  return is(String, result) ? result : result
}

const _toString = context => () =>
  context.nothing
    ? 'Nothing'
    : 'Just ' + _json(context.value)

const _evalIs = (type, value) =>
  type === Object
    ? is(type, value) && !is(Array, value) && !is(Function, value) && !is(Date, value)
    : is(type, value)

const _is = context => type =>
  context.nothing
    ? false
    : _evalIs(type, context.value)

const _safe = (value, left, right, notypes = [], doesimplement = []) =>
  (isNil(value) || notypes.find(t => _evalIs(t, value)))
  && !doesimplement.find(m => value && !!value[m]) ? left : right()

const _test = (left, right, item) =>
  item && item.constructor === Maybe ? right() : left

const _type = () => libType

function Maybe(value, nothing, promise = undefined) {
  if(!arguments.length) {
    throw new TypeError('Invalid Maybe constructor')
  }

  const context = () => value
  context.value = value
  context.nothing = !!nothing
  context.promise = promise
  promise && promise.then(result => _evalAsyncOfPromise(context, result))

  context.test = (left, right, notypes = [], doesimplement = []) =>
    _safe(value, left, right, notypes, doesimplement)
  context.alt = _alt(context)
  context.ap = _ap(context)
  context.chain = _chain(context)
  context.concat = _concat(context)
  context.constructor = Maybe
  context.either = _either(context)
  context.empty = _empty(context)
  context.equals = _equals(context)
  context.is = _is(context)
  context.isJust = _isJust(context)
  context.isNothing = _isNothing(context)
  context.map = _map(context)
  context.of = Just
  context.valueOr = _valueOr(context)
  context.toJust = _toJust(context)
  context.toString = _toString(context)
  context.type = _type
  context.zero = Nothing
  context[fantasyLand.alt] = _alt(context)
  context[fantasyLand.chain] = _chain(context)
  context[fantasyLand.concat] = _concat(context)
  context[fantasyLand.equals] = _equals(context)
  context[fantasyLand.map] = _map(context)
  context[fantasyLand.of] = Just
  context[fantasyLand.zero] = Nothing
  context['@@type'] = libType

  promise || Object.freeze(context)

  return context
}

Maybe.Just = Just
Maybe.Nothing = Nothing
Maybe.asyncOf = _asyncOf
Maybe.empty = Nothing
Maybe.of = Just
Maybe.safeOf = _safeOf
Maybe.test = (left, right) => item => _test(left, right, item)
Maybe.zero = Nothing
Maybe[fantasyLand.of] = Just
Maybe[fantasyLand.empty] = Nothing
Maybe[fantasyLand.zero] = Nothing

Maybe['@@type'] = libType
Maybe.type = _type

Maybe['@@implements'] = _implements

module.exports = Maybe
