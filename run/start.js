require('./minify')

let { mkdirSync, readFileSync, writeFileSync } = require('fs')
let { join } = require('path')

let tokenizePrd = require('postcss/lib/tokenize')
let tokenizeDev = require('../tokenizer')
let tokenizeDevMin = require('../tokenizer/min')
let ParserPrd = require('postcss/lib/parser')
let parserDev = require('../parser')
let postcssSelectorParser = require('postcss-selector-parser')()
let { parse: postcssValuesParser } = require('postcss-values-parser')

let bootstrapCSSPath = require.resolve('bootstrap/dist/css/bootstrap.css')
let bootstrapCSS = require('fs').readFileSync(bootstrapCSSPath, 'utf8')

Object.entries({
	'postcss-tokenizer-7_0_30.json': () => {
		let tokenized = tokenizePrd({ css: bootstrapCSS })
		let tokens = []
		while (!tokenized.endOfFile()) tokens.push(tokenized.nextToken())
		return tokens
	},
	'postcss-tokenizer-development.json': () => {
		let tokens = []
		tokenizeDev(bootstrapCSS, (type, prev, spot, lead, tail) => {
			tokens.push([type, prev, spot, lead, tail, ...[bootstrapCSS.slice(prev, prev + lead), bootstrapCSS.slice(prev + lead, spot - tail), bootstrapCSS.slice(spot - tail, spot)].filter(Boolean)])
		})
		return tokens
	}
}).forEach(([ file, getTokens ]) => {
	let resultsDir = join(__dirname, '..', 'results')
	let resultsFile = join(resultsDir, file)
	let tokens = getTokens()
	mkdirSync(resultsDir, { recursive: true })
	writeFileSync(resultsFile, JSON.stringify(tokens, null, '  '))
	console.log(`Wrote ${tokens.length} tokens to ${file}.`)
})
