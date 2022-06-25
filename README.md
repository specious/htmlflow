Lightweight and fast single-pass HTML formatter that uses [htmlparser2](https://github.com/fb55/htmlparser2)

## Description

This HTML formatter is optimized for speed and configurability. Although it may incidentally fix certain issues with malformed HTML, it is designed to work properly only with already valid markup.

## Install

```
npm i @specious/htmlflow
```

## Usage

```js
const htmlflow = require('@specious/htmlflow')
const fs = require('fs')

;(async () => {
  let content = fs.readFileSync('./index.html')
  let formatted = await htmlflow(content, {
    indent: 2,
    tabs: false,
    spacesPerTab: 4,
    formatting: true,
    comments: true
  })

  console.log(formatted)
})()
```
