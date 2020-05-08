let { mkdirSync, readFileSync, writeFileSync } = require('fs')
let { dirname, join } = require('path')
let { minify } = require('terser')
let { gzipSync, constants: { Z_BEST_COMPRESSION } } = require('zlib')

console.log('')
console.log('Compressing PostCSS Parser...')
console.log('')

// read the parser
let tokenizeFile = join(__dirname, '..', 'parser', 'index.js')
let tokenizeCode = readFileSync(tokenizeFile, 'utf8')
let tokenizeSize = gzipSync(tokenizeCode, Z_BEST_COMPRESSION).length
console.log(`PostCSS Parser Development:       ${tokenizeSize} B`)

// terser minification options
let tokenizeMinOpts = {
	toplevel: true,
	keep_classnames: true,
	keep_fnames: true,
	compress: {
		unsafe: true,
		loops: false,
		global_defs: {}
	}
}

// remove top-level variables and store them as terser minification global definitions
let tokenizeMinCode1of3 = tokenizeCode.replace(/^var +([A-Z_]+) *= *(0x[0-9A-F]+)( *\/\/[^\n]*)?\n/gm, ($0, $1, $2) => {
	tokenizeMinOpts.compress.global_defs[$1] = Number($2)
	return ''
})

// minify the code, replacing top-level variables with the global definitions
let { code: tokenizeMinCode2of3 } = minify(tokenizeMinCode1of3, tokenizeMinOpts)
// trim any trailing semicolons or newlines
let tokenizeMinCode = tokenizeMinCode2of3.replace(/[\n\r;]+$/g, '')

// write the minified tokenizer
let tokenizeMinFile = join(__dirname, '..', 'parser', 'min', 'index.js')
let tokenizeMinSize = gzipSync(tokenizeMinCode, Z_BEST_COMPRESSION).length
mkdirSync(dirname(tokenizeMinFile), { recursive: true })
writeFileSync(tokenizeMinFile, tokenizeMinCode)
console.log(`PostCSS Parser Development (min):  ${tokenizeMinSize} B`)

// minify the web code, replacing top-level variables with the global definitions
let tokenizeWebCode1of3 = tokenizeMinCode1of3.replace(/^var +([A-Za-z]+) *= *require\([^\n]*\n/gm, '')
let { code: tokenizeWebCode2of3 } = minify(tokenizeWebCode1of3, tokenizeMinOpts)
// trim any trailing semicolons or newlines
let tokenizeWebCode = tokenizeWebCode2of3.replace(/[\n\r;]+$/g, '').replace(/module.exports=function parse/g, 'function parseCSS')

// write the web-ified file
let tokenizeWebFile = join(__dirname, '..', 'parser', 'web', 'index.js')
let tokenizeWebSize = gzipSync(tokenizeWebCode, Z_BEST_COMPRESSION).length
mkdirSync(dirname(tokenizeWebFile), { recursive: true })
writeFileSync(tokenizeWebFile, tokenizeWebCode)
console.log(`PostCSS Parser Development (web):  ${tokenizeWebSize} B`)
