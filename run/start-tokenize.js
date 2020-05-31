
let { mkdirSync, readFileSync, writeFileSync } = require('fs')
let { join } = require('path')

let tokenizePrd = require('postcss/lib/tokenize')
let tokenizeDev = require('../tokenize')

let bootstrapCSSPath = require.resolve('bootstrap/dist/css/bootstrap.css')
let bootstrapCSS = readFileSync(bootstrapCSSPath, 'utf8')

Object.entries({
	'postcss-tokenize-7_0_30.json': () => {
		let tokenized = tokenizePrd({ css: bootstrapCSS })
		let tokens = []
		while (!tokenized.endOfFile()) tokens.push(tokenized.nextToken())
		return tokens
	},
	'cssom-tokenize.json': () => {
		let tokens = []
		tokenizeDev(bootstrapCSS, (type, open, shut, lead, tail) => {
			tokens.push([type, open, shut, lead, tail, ...[bootstrapCSS.slice(open, open + lead), bootstrapCSS.slice(open + lead, shut - tail), bootstrapCSS.slice(shut - tail, shut)].filter(Boolean)])
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
