Lightweight HTML formatter that uses [htmlparser2](https://github.com/fb55/htmlparser2)

## Usage

```js
const htmlformat = require('htmlformat')
const fs = require('fs')

;(async () => {
  let content = fs.readFileSync('./index.html', 'utf8')
  let formatted = await htmlformat(content)

  console.log(formatted)
})()
```
