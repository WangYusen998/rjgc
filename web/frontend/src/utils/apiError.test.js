import test from 'node:test'
import assert from 'node:assert/strict'
import { ApiError, mapApiErrorMessage } from './apiError.js'

test('ApiError keeps status/code/details', () => {
  const err = new ApiError('Boom', { status: 401, code: 'HTTP_401', details: { message: 'x' } })
  assert.equal(err.message, 'Boom')
  assert.equal(err.status, 401)
  assert.equal(err.code, 'HTTP_401')
  assert.deepEqual(err.details, { message: 'x' })
})

test('mapApiErrorMessage maps common status codes', () => {
  assert.equal(mapApiErrorMessage(401), 'Email or password is incorrect.')
  assert.equal(mapApiErrorMessage(403), 'You do not have permission to perform this action.')
  assert.equal(mapApiErrorMessage(409), 'This data already exists or conflicts with current state.')
  assert.equal(mapApiErrorMessage(503), 'Server error. Please try again later.')
  assert.equal(mapApiErrorMessage(418, 'Fallback'), 'Fallback')
})

