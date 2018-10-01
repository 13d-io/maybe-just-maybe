const { is, type, curry } = require('ramda')

const MaybeType = 'Function'

const isFunction = item => type(item) === 'Function'

const typesMatch = (x, y) => {
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

module.exports = {
  bindFunc,
  isArray,
  isFunction,
  typesMatch: curry(typesMatch),
  unit: Function.prototype
}
