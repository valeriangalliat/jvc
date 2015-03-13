const { denodeify, xml } = require('./util')
const request = require('request')

// Promisified request.
export const requestPromise = Object.assign(denodeify(request), request)

// Request with bound credentials.
export const requestAuth = ({ request, user, pass }) =>
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
