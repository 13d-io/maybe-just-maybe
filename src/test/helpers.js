const { and, is, not, type, curry } = require('ramda')

const MaybeType = 'Function'

const fantasyLand = {
  alt: 'fantasy-land/alt',
  bimap: 'fantasy-land/bimap',
  chain: 'fantasy-land/chain',
  compose: 'fantasy-land/compose',
  concat: 'fantasy-land/concat',
  contramap: 'fantasy-land/contramap',
  empty: 'fantasy-land/empty',
  equals: 'fantasy-land/equals',
  extend: 'fantasy-land/extend',
  id: 'fantasy-land/id',
  map: 'fantasy-land/map',
  of: 'fantasy-land/of',
  promap: 'fantasy-land/promap',
  reduce: 'fantasy-land/reduce',
  zero: 'fantasy-land/zero'
}

const isFunction = item => type(item) === 'Function'

const isSameType = (x, y) => {
  const xType = type(x)
  const yType = type(y)

  if (xType === MaybeType && yType === MaybeType
    && isFunction(x.type) && isFunction(y.type)) {
    return x.type() === y.type()
  }

  return xType === yType
}

const slice =
  x => Array.prototype.slice.call(x)

function bindFunc(fn) {
  return function() {
    return Function.bind.apply(fn, [ null ].concat(slice(arguments)))
  }
}

const isArray = is(Array)
const isObject = item => and(is(Object, item), not(is(Array, item)))
const isString = is(String)

module.exports = {
  bindFunc,
  fantasyLand,
  isArray,
  isObject,
  isFunction,
  isSameType: curry(isSameType),
  isString,
  unit: Function.prototype
}
