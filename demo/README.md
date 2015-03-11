Demo
====

> Demo for [jvc] usage.

[jvc]: https://github.com/valeriangalliat/jvc

Description
-----------

This is an interactive example to show the jeuxvideo.com API login using
this client, and the first private messages page retrieval.

Everything is in [`index.js`](index.js).

Usage
-----

```js
npm install
npm start
```

You will be prompted for your jeuxvideo.com username and password. A
captcha will be downloaded in `captcha.png` and will be opened using
`xdg-open` (you need to adapt this if you don't have the `xdg-open`
command, like `open` on MacOS, or `start` on Windows). You have to input
the captcha (it will retry until success).

When the login is complete, a beautiful table with your last private
messages is displayed.
