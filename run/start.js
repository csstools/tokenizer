require('./minify')

let { mkdirSync, readFileSync, writeFileSync } = require('fs')
let { join } = require('path')

let tokenizePrd = require('postcss/lib/tokenize')
let tokenizeDev = require('../tokenizer')
let tokenizeDevMin = require('../tokenizer/min')

let bootstrapCSS = readFileSync(require.resolve('bootstrap/dist/css/bootstrap.css'), 'utf8')

Object.entries({
	'postcss-tokenizer-7_0_27.json': () => {
		let tokenized = tokenizePrd({ css: bootstrapCSS })
		let tokens = []
		while (!tokenized.endOfFile()) tokens.push(tokenized.nextToken())
		return tokens
	},
	'postcss-tokenizer-development.json': () => tokenizeDev(bootstrapCSS),
	'postcss-tokenizer-development.min.json': () => tokenizeDevMin(bootstrapCSS)
}).forEach(([ file, getTokens ]) => {
	let resultsDir = join(__dirname, '..', 'results')
	let resultsFile = join(resultsDir, file)
	let tokens = getTokens()
	mkdirSync(resultsDir, { recursive: true })
	writeFileSync(resultsFile, JSON.stringify(tokens, null, '  '))
	console.log(`Wrote ${tokens.length} tokens to ${file}.`)
})
