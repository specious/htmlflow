Lightweight HTML formatter that uses [htmlparser2](https://github.com/fb55/htmlparser2)

## Description

This HTML formatter is optimized for speed and configurability. Although it may incidentally fix certain issues with malformed HTML, it is designed to work properly with valid markup.

## Usage

```js
const htmlformat = require('htmlformat')
const fs = require('fs')

;(async () => {
  let content = fs.readFileSync('./index.html', 'utf8')
  let formatted = await htmlformat(content, {
    indent: 2,
    tabs: false.
    formatting: true,
    comments: true
  })

  console.log(formatted)
})()
```
