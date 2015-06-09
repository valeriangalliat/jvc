const { denodeify, err, xml } = require('./util')
const request = require('request')
const util = require('request/lib/helpers')

// Promisified request.
export const requestPromise = Object.assign(denodeify(request), request)

// Request with bound credentials.
export const requestAuth = ({ request, user, pass }) =>
  request.defaults({
    auth: { user, pass }
  })

// Apply base path to given options.
const optionsPage = (base, options) =>
  Object.assign({}, options, { uri: base + (options.uri || options.url) })

// Request relative to base path.
export const requestPage = ({ request, base }) =>
  Object.assign(
    (...args) =>
      request(
        optionsPage(base, util.constructOptionsFrom(...args)),
        util.filterForCallback(args)
      ),
    request
  )

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
export const requestCookie = ({ request, cookie }) => {
  if (!cookie) {
    throw err('You must be logged in.')
  }

  return request.defaults({
    headers: { cookie }
  })
}
