const test = require('tape')
const JustMaybe = require('./index')

const Maybe = require('./core/Maybe')

test('entry', t => {

  t.equal(JustMaybe, Maybe, 'provides the Maybe monad')

  t.end()
})
