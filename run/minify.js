let { mkdirSync, readFileSync, writeFileSync } = require('fs')
let { dirname, join } = require('path')
let { minify } = require('terser')
let { gzipSync, constants: { Z_BEST_COMPRESSION } } = require('zlib')

console.log('')
console.log('Compressing PostCSS Tokenizer...')
console.log('')

// read the tokenizer
let tokenizeFile = join(__dirname, '..', 'tokenizer', 'index.js')
let tokenizeCode = readFileSync(tokenizeFile, 'utf8')
let tokenizeSize = gzipSync(tokenizeCode, Z_BEST_COMPRESSION).length
console.log(`PostCSS Tokenizer Development:       ${tokenizeSize} B`)

// terser minification options
let tokenizeMinOpts = {
	toplevel: true,
	keep_classnames: false,
	keep_fnames: false,
	compress: {
		unsafe: true,
		loops: false,
		global_defs: {}
	}
}

// remove top-level variables and store them as terser minification global definitions
let tokenizeMinCode1of3 = tokenizeCode.replace(/^var ([A-Z_]+) += (0x[0-9A-F]+)( \/\/[^\n])?\n/gm, ($0, $1, $2) => {
	tokenizeMinOpts.compress.global_defs[$1] = Number($2)
	return ''
})
// minify the code, replacing top-level variables with the global definitions
let { code: tokenizeMinCode2of3 } = minify(tokenizeMinCode1of3, tokenizeMinOpts)
// trim any trailing semicolons or newlines
let tokenizeMinCode = tokenizeMinCode2of3.replace(/[\n\r;]+$/g, '')

// write the minified tokenizer
let tokenizeMinFile = join(__dirname, '..', 'tokenizer', 'min', 'index.js')
let tokenizeMinSize = gzipSync(tokenizeMinCode, Z_BEST_COMPRESSION).length
mkdirSync(dirname(tokenizeMinFile), { recursive: true })
writeFileSync(tokenizeMinFile, tokenizeMinCode)
console.log(`PostCSS Tokenizer Development (min):  ${tokenizeMinSize} B`)

// write the web-ified file
let tokenizeWebFile = join(__dirname, '..', 'tokenizer', 'web', 'index.js')
let tokenizeWebCode = tokenizeMinCode.replace(/^module\.exports=/, 'CSSTokenizer=')
let tokenizeWebSize = gzipSync(tokenizeWebCode, Z_BEST_COMPRESSION).length
mkdirSync(dirname(tokenizeWebFile), { recursive: true })
writeFileSync(tokenizeWebFile, tokenizeWebCode)
console.log(`PostCSS Tokenizer Development (web):  ${tokenizeWebSize} B`)
