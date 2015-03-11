const chalk = require('chalk')
const cp = require('child_process')
const fs = require('fs')
const inquirer = require('inquirer')
const pipe = require('promisepipe')
const request = require('request')
const Table = require('cli-table');
const jvc = require('../src')

const prompt = (...args) =>
  new Promise(
    resolve => inquirer.prompt(...args, resolve)
  )

const handleCaptcha = async err => {
  if (!err.captcha) {
    throw err
  }

  console.log(`${chalk.green('»')} Downloading captcha...`)

  await pipe(
    request(err.captcha),
    fs.createWriteStream('captcha.png')
  )

  cp.spawn('xdg-open', ['captcha.png'], {
    stdio: ['ignore', 'ignore', 'ignore']
  }).unref()

  return await prompt({ name: 'code', message: 'Captcha' })
    .then(x => x.code)
    .then(code => err.retry(code).then(null, handleCaptcha))
}

async () => {
  const user = await prompt([
    { name: 'user', message: 'User' },
    { type: 'password', name: 'pass', message: 'Pass' },
  ])

  const userJvc = jvc.override({
    user,
  })

  const connectedJvc = await userJvc.user.login()
    .then(x => x, handleCaptcha)

  // You can store and reuse the cookie to avoid the captcha.
  // console.log(connectedJvc.user.cookie)

  // const connectedJvc = jvc.override({
  //   user: {
  //     // cookie: 'the cookie you stored',
  //   },
  // })

  const messages = await connectedJvc.pm.getFirstPage()

  const table = new Table({
    head: ['R', 'From', 'Subject', 'Date'],
  });

  table.push(...messages.map(m => [
    m.isRead ? 'Y' : 'N',
    m.author,
    m.subject,
    m.date.toISOString().substr(0, 10),
  ]))

  console.log(table.toString())
}()
  .then(null, err => setTimeout(() => { throw err }))
