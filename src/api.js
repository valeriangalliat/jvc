const { denodeify, xml } = require('./util')
const request = Object.assign(denodeify(require('request')), require('request'))

// Promisified request with bound credentials.
export const requestAuth = ({ user, pass }) =>
  request.defaults({
    auth: { user, pass },
  })

// Wrap a request to parse XML.
export const requestXml = ({ request }) =>
  Object.assign(
    (...args) =>
      request(...args)
        .then(async response =>
          Object.assign(response, { body: await xml(response.body) })
        ),
    request
  )

// Request with bound cookie.
export const requestCookie = ({ request, cookie }) =>
  request.defaults({
    headers: { cookie },
  })
