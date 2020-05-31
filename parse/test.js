let { readFileSync } = require('fs')
let bootstrapCSSPath = require.resolve('bootstrap/dist/css/bootstrap.css')
let bootstrapCSS = readFileSync(bootstrapCSSPath, 'utf8')
let tokenizeWithConsumer = require('./consume.value')
bootstrapCSS = `
/* Listen up */

button:not(:disabled),
[type="button"]:not(:disabled),
[type="reset"]:not(:disabled),
[type="submit"]:not(:disabled) {
  cursor: pointer;
}
`.trim()

var cssRoot = tokenizeWithConsumer(bootstrapCSS)

console.log(JSON.stringify(cssRoot.toJSON().nodes, null, '  '))

if (cssRoot.toString() !== bootstrapCSS) {
	console.log('================================================================================')
	console.log(cssRoot.toString())
	console.log('================================================================================')
	console.log(bootstrapCSS)
	console.log('================================================================================')
}
