let { mkdirSync, readFileSync, writeFileSync } = require('fs')
let { join } = require('path')

let tokenize_prd = require('postcss/lib/tokenize')
let tokenize_dev = require('./tokenizer')

let bootstrapCSS = readFileSync(require.resolve('bootstrap/dist/css/bootstrap.css'), 'utf8')

Object.entries({
	'postcss-tokenizer-7_0_27.json': () => {
		let tokenized = tokenize_prd({ css: bootstrapCSS })
		let tokens = []
		while (!tokenized.endOfFile()) tokens.push(tokenized.nextToken())
		return tokens
	},
	'postcss-tokenizer-development.json': () => tokenize_dev(bootstrapCSS)
}).forEach(([ name, getTokens ]) => {
	let dir = join(__dirname, 'results')
	let file = join(dir, name)
	let tokens = getTokens()
	mkdirSync(dir, { recursive: true })
	writeFileSync(file, JSON.stringify(tokens, null, '  '))
	console.log(`Wrote ${tokens.length} tokens to ${name}.`)
})