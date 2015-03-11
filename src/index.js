const bindLate = require('bind-late')
const extend = require('extend')
const request = require('request')

const { denodeify } = require('./util')
const user = require('./user')
const pm = require('./pm')

export default bindLate({

  // Thanks <https://wiki.jvflux.com/Documentation_de_l'API_Jeuxvideo.com#Identification>.
  clients: [
    ['Android 1.0', 'appandr', 'e32!cdf'],
    ['Android 2.0.3', 'app_and_gnw', 'FC?4554?'],
    ['Android 2.5', 'app_and_ms', 'D9!mVR4c'],
    ['Android MP', 'app_ag_jvmp', 'LXnb45=d#'],
    ['Android Tab' ,'nex12sz', 'GT4!V2cT'],
    ['iPhone', 'app_ios_nw', 'W!P45-R'],
    ['iPad', 'ip45de', 'XpD5!FT'],
  ],

  api: {
    base: 'https://ws.jeuxvideo.com/',
    salt: 'OpX234',

    // Take random credentials from known list by default.
    _client: _ => _.clients[Math.round(Math.random() * (_.clients.length - 1))],

    // API client we're masquerading.
    client: _ => _.api.user ? 'Unknown' : _.api._client[0],

    // Extract credentials (internal usage).
    _user: _ => _.api.user || _.api._client[1],
    _pass: _ => _.api.pass || _.api._client[2],

    // Request with bound credentials, returning a promise.
    request: _ => denodeify(request.defaults({
      auth: {
        user: _.api._user,
        pass: _.api._pass,
      },
    })),

    // Request with bound cookie.
    requestCookie: _ => async arg =>
      await _.api.request(extend(
        { headers: { cookie: _.user.cookie } },
        typeof arg === 'string' ? { url: arg } : arg
      )),

    // Apply base path to given page.
    page: _ => path => _.api.base + path,
  },

  user: {
    getAuthParams: _ => user.getAuthParams({
      salt: _.api.salt,
      user: _.user.user,
      pass: _.user.pass,
    }),

    login: _ => user.login({
      self: _,
      page: _.api.page,
      request: _.api.request,
      getAuthParams: _.user.getAuthParams,
    }),
  },

  pm: {
    getFirstPage: _ => pm.getFirstPage({
      requestCookie: _.api.requestCookie,
      page: _.api.page,
    }),
  },
})
