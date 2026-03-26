import test from 'node:test'
import assert from 'node:assert/strict'
import { isTokenExpired, parseJwtPayload } from './session.js'

function makeJwt(payload) {
  const header = { alg: 'HS256', typ: 'JWT' }
  const encode = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url')
  return `${encode(header)}.${encode(payload)}.signature`
}

test('parseJwtPayload returns payload object', () => {
  const token = makeJwt({ sub: 1, exp: 9999999999 })
  const payload = parseJwtPayload(token)
  assert.equal(payload.sub, 1)
  assert.equal(payload.exp, 9999999999)
})

test('isTokenExpired returns true for expired token', () => {
  const token = makeJwt({ exp: Math.floor(Date.now() / 1000) - 60 })
  assert.equal(isTokenExpired(token), true)
})

test('isTokenExpired returns false for token without exp', () => {
  const token = makeJwt({ sub: 1 })
  assert.equal(isTokenExpired(token), false)
})

