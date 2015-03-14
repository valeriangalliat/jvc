# jvc [![npm version](http://img.shields.io/npm/v/jvc.svg?style=flat-square)](https://www.npmjs.org/package/jvc)

> Node.js [jeuxvideo.com][] [API] client.

[jeuxvideo.com]: http://www.jeuxvideo.com/
[API]: https://wiki.jvflux.com/Documentation_de_l'API_Jeuxvideo.com

Caution
-------

This library *is in early beta*, and not complete *at all*. I
implemented only the methods I needed, and I'm not going to add support
for other methods unless I need them too.

However, I happily accept pull requests; feel free to implement the
features you need, and please [get in touch with me][val] if you need
some advices on how to hack this library.

[val]: https://val.codejam.info/

Usage
-----

```js
const jvc = require('jvc')
```

You can then call all the supported API methods on the `jvc` object.
Some methods will require you to be [logged in](#login) (like [private
messages access](#private-messages) and forums post), while others will
work anonymously.

Also, the `jvc` object is fully overridable thanks to [bind-late]. Look
[the source](src/index.js) to see what you can customize!

[bind-late]: https://github.com/valeriangalliat/bind-late

All code examples that need a connected API will use `connectedJvc`
object, and anonymous methods will just use `jvc`.

All the code examples assume to be run in an ES7 asynchronous function.

### Login

```js
// Need to handle captcha prompts.
const handleCaptcha = async err => {
  if (!err.captcha) {
    throw err
  }

  // Prompt the user to fill given captcha URL.
  const code = await doSomethingWith(err.captcha)

  return await err.retry(code) // Retry request.
    .then(null, handleCaptcha) // Recursively ask for captcha.
}

const connectedJvc = await jvc.login({ user: 'foo', pass: 'bar' })
  .then(null, handleCaptcha)

// You can then call methods that require connection on `connectedJvc`.
```

**Note:** once you have a `connectedJvc` object, you can find the
connection cookie in `connectedJvc.user.cookie`. If you store it
permanently, you can restore it like this:

```js
const connectedJvc = jvc.override({
  user: { cookie: 'the cookie you stored' },
})
```

This way you avoid getting the captcha prompt everytime. Though, I have
no idea how long the cookie will stay valid. Please tell me if you have
more informations about this.

### Private messages

#### List

```js
// Get first page.
const list = await connectedJvc.pm.list()

// list:
//   count: Number
//   page: Number
//   unread: Number
//   threads:
//     - id: Number
//       subject: String
//       author: String
//       date: Date
//       isRead: Boolean
//

// Get second page.
const next = await connectedJvc.pm.list({ page: 2 })
```

#### Thread

```js
// Get the last 5 messages of a thread (ID from previous list).
const thread = await connectedJvc.pm.thread({ id: list.threads[0].id })

// thread:
//   id: Number
//   subject: String
//   members: [String]
//   count: Number
//   next: Number
//   messages:
//     - image: String
//       author: String
//       date: Date
//       post: String

// Get next 10 messages.
const next = await connectedJvc.pm.thread({
  id: list.threads[0].id,
  offset: thread.next,
})
```

Example
-------

See the [jvc-cli] project for a concrete usage example. Or if you just
want an interactive demo:

```js
npm install -g jvc-cli
jvc login
jvc pm
```

[jvc-cli]: https://github.com/valeriangalliat/jvc-cli
