const bindLate = require('bind-late')

const { denodeify } = require('./util')
const api = require('./api')
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

    requestAuth: _ => api.requestAuth({
      request: api.requestPromise,
      user: _.api._user,
      pass: _.api._pass
    }),

    requestXml: _ => api.requestXml({ request: _.api.requestAuth }),

    requestCookie: _ => api.requestCookie({
      request: _.api.requestXml,
      cookie: _.user.cookie,
    }),

    // Apply base path to given page.
    page: _ => path => _.api.base + path,
  },

  user: {
    getAuthParams: _ => user.getAuthParams({ salt: _.api.salt }),

    login: _ => user.login({
      self: _,
      page: _.api.page,
      request: _.api.requestXml,
      getAuthParams: _.user.getAuthParams,
    }),
  },

  pm: {
    getFirstPage: _ => pm.getFirstPage({
      request: _.api.requestCookie,
      page: _.api.page,
    }),
  },

  // Friendly alias.
  login: _ => _.user.login,
})
