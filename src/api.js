const { denodeify, xml } = require('./util')
const extend = require('extend')
const request = Object.assign(denodeify(require('request')), require('request'))

// Promisified request with bound credentials.
export const requestAuth = ({ user, pass }) =>
  request.defaults({
    auth: { user, pass },
  })

// Wrap a request to parse XML.
export const requestXml = ({ request }) =>
  extend(
    (...args) =>
      request(...args)
        .then(async response => extend({}, response, { body: await xml(response.body) })),
    request
  )

// Request with bound cookie.
export const requestCookie = ({ request, cookie }) =>
  request.defaults({
    headers: { cookie },
  })
