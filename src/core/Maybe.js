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

const _isNothingBase = context => context.nothing

const _isNothing = context => () => context.nothing

const _isJustBase = context => !context.nothing

const _isJust = context => () => !context.nothing

const _valueOrBase = (defaultValue, context) =>
  context.nothing ? defaultValue : context.value

const _valueOr = context => defaultValue =>
  _valueOrBase(defaultValue, context)

const _evalAlt = (context, other) => () => {
  return context.nothing && !other.nothing && context.toJust(other.value) || context
}

const _altBase = (context, other) =>
  _test(
    Nothing(), _evalAlt(context, other), other
  )

const _alt = context => other =>
  _altBase(context, other)

const _eitherBase = (left, right, context) =>
  context.nothing ? left() : right(context.value)

const _either = context => (left, right) =>
  _eitherBase(left, right, context)

const _evalEquals = (context, other) => () =>
  context.nothing ? other.nothing : equals(other.value, context.value) && !other.nothing

const _equalsBase = (context, other) =>
  _test(false, _evalEquals(context, other), other)

const _equals = context => other =>
  _equalsBase(context, other)

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

const _concatBase = (context, other) =>
  _test(Nothing(), _testConcat(context, other), other)

const _concat = context => other =>
  _concatBase(context, other)

const _evalMap = (f, context) => () =>
  Just(map(f, context.value))

const _changeMapToAp = (f, context) => () =>
  Just(f(context.value))

const _testMapToAp = (f, context) => _safe(
  context.value, Nothing(), _changeMapToAp(f, context)
)

const _mapBase = (f, context) =>
  _safe(
    context.value,
    () => _testMapToAp(f, context),
    () => _evalMap(f, context),
    [ Number, String, Boolean ],
    [ 'map' ]
  )()

const _map = context => f =>
  _mapBase(f, context)

const _evalAp = (f, context) => context.nothing ? Nothing() : Just(f(context.value))

const _testApContext = (context, other) =>
  typeof context.value === 'function' && _evalAp(context.value, other)

const _testAp = (context, other) => () => {
  return _testApContext(context, other)
    || _testApContext(other, context)
    || Nothing()
}

const _apBase = (context, other) =>
  _test(Nothing(), _testAp(context, other), other)

const _ap = context => other =>
  _apBase(context, other)

const _evalChain = (f, context) => () => {
  const res = f(context.value)
  return _test(Nothing(), () => res, res)
}

const _chainBase = (f, context) =>
  _safe(
    context.value, Nothing(), _evalChain(f, context)
  )

const _chain = context => f =>
  _chainBase(f, context)

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

const _isBase = (type, context) =>
  context.nothing
    ? false
    : _evalIs(type, context.value)

const _is = context => type =>
  _isBase(type, context)

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

Maybe.alt = _alt
Maybe.altU = _altBase
Maybe.ap = _ap
Maybe.apU = _apBase
Maybe.chain = f => context => _chainBase(f, context)
Maybe.chainU = _chainBase
Maybe.concat = _concat
Maybe.concatU = _concatBase
Maybe.either = (left, right) => context => _eitherBase(left, right, context)
Maybe.eitherU = _eitherBase
Maybe.equals = _equals
Maybe.equalsU = _equalsBase
Maybe.is = type => context => _isBase(type, context)
Maybe.isU = _isBase
Maybe.isJust = _isJustBase
Maybe.isNothing = _isNothingBase
Maybe.map = f => context => _mapBase(f, context)
Maybe.mapU = _mapBase
Maybe.valueOr = defaultValue => context => _valueOrBase(defaultValue, context)
Maybe.valueOrU = _valueOrBase
Maybe.toString = _toString

Maybe['@@type'] = libType
Maybe.type = _type

Maybe['@@implements'] = _implements

module.exports = Maybe
