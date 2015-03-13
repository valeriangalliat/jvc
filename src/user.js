const qs = require('querystring').parse
const { err, md5 } = require('./util')

export const getAuthParams = ({ salt }) =>
  async ({ user, pass }) => {
    const time = Math.round(Date.now() / 1000)

    return {
      newnom: user,
      stamp: time,
      hash: await md5(user + pass + salt + time),
    }
  }

// Return a new API with bound cookie (might fail for captcha).
export const login = ({ self, page, request, getAuthParams }) =>
  async ({ user, pass, params = {} }) => {
    const response = await request({
      method: 'POST',
      url: page('mon_compte/connexion.php'),
      form: Object.assign({}, await getAuthParams({ user, pass }), params),
    })

    if (!response.body.connexion.erreur) {
      return self.override({
        user: {
          user,
          pass,
          cookie: response.body.connexion.cookie[0],
        },
      })
    }

    const e = response.body.connexion.erreur[0]
    const params = qs(e.params_form[0])

    if (e.captcha) {
      throw err('Captcha required.', {
        captcha: e.captcha[0],
        params,

        retry: code =>
          self.user.login({
            user,
            pass,
            params: Object.assign({ code }, params),
          }),
      })
    }

    throw err(`Login error: ${e.texte_erreur[0]}`)
  }
