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

Currently, only retrieving the first page is supported.

```js
const messages = await connectedJvc.pm.getFirstPage()

messages.forEach(message => {
  // message.id
  // message.subject
  // message.author
  // message.date
  // message.isRead
})
```

Demo
----

See the [demo](demo) directory for a cool interactive example.
