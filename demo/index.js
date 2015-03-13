const { denodeify } = require('../src/util')
const jvc = require('../src')

const chalk = require('chalk')
const cp = require('child_process')
const fs = require('fs')
const inquirer = require('inquirer')
const pipe = require('promisepipe')
const request = require('request')
const Table = require('cli-table');

const readFile = denodeify(fs.readFile)

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
  // Get existing cookie or prompt for credentials.
  const user = await readFile('cookie.txt', 'utf8')
    .then(cookie => ({ cookie }), () => prompt([
      { name: 'user', message: 'User' },
      { type: 'password', name: 'pass', message: 'Pass' },
    ]))

  const connectedJvc = user.cookie
    ? jvc.override({ user })
    : await jvc.login(user).then(null, handleCaptcha)

  // Keep cookie for next run.
  fs.writeFile('cookie.txt', connectedJvc.user.cookie)

  const threads = (await connectedJvc.pm.list()).threads

  const table = new Table({
    head: ['R', 'From', 'Subject', 'Date'],
  });

  table.push(...threads.map(t => [
    t.isRead ? 'Y' : 'N',
    t.author,
    t.subject,
    t.date.toISOString().substr(0, 10),
  ]))

  console.log(table.toString())
}()
  .then(null, err => setTimeout(() => { throw err }))
