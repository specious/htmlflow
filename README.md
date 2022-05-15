Lightweight HTML formatter that uses [htmlparser2](https://github.com/fb55/htmlparser2)

## Description

This HTML formatter is optimized for speed and configurability. Although it may incidentally fix certain issues with malformed HTML, it is designed to work properly with already valid markup.

## Install

```
npm i @specious/html-flow
```

## Usage

```js
const htmlflow = require('htmlflow')
const fs = require('fs')

;(async () => {
  let content = fs.readFileSync('./index.html', 'utf8')
  let formatted = await htmlflow(content, {
    indent: 2,
    tabs: false.
    formatting: true,
    comments: true
  })

  console.log(formatted)
})()
```
