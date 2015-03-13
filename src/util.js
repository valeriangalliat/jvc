const { hash } = require('crypto-promise')

export const denodeify = require('es6-denodeify')(Promise)

export const err = (message, props) =>
  Object.assign(new Error(message), props)

export const xml = denodeify(require('xml2js').parseString)

export const md5 = async data =>
  (await hash('md5')(data)).toString('hex')
