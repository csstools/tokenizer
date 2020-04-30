require('./minify')

let write = process.stdout.write.bind(process.stdout)
let indent = (a, b) => ' '.repeat(Math.abs(a.length - b.length))
let mstime = hz => `${Math.round((1 / hz) * 1000).toString()} ms`

let tokenizePrd = require('postcss/lib/tokenize')
let tokenizeDev = require('../tokenizer')
let tokenizeDevMin = require('../tokenizer/min')

let bootstrapCSS = require('fs').readFileSync(
	require.resolve('bootstrap/dist/css/bootstrap.css'),
	'utf8'
)

let tokenList = []

write('\nCollecting PostCSS Tokenizer Benchmarks...\n')

Object.entries({
	'PostCSS Tokenizer 7.0.27': () => {
		let tokenized = tokenizePrd({ css: bootstrapCSS })
		let tokens = []
		while (!tokenized.endOfFile()) tokens.push(tokenized.nextToken())
		tokenList[0] = tokens
	},
	'PostCSS Tokenizer Development': () => {
		let tokens = tokenizeDev(bootstrapCSS)
		tokenList[1] = tokens
	},
	'PostCSS Tokenizer Development (min)': () => {
		let tokens = tokenizeDevMin(bootstrapCSS)
		tokenList[2] = tokens
	}
}).reduce(
	(suite, [name, func]) => suite.add(name, func),
	new (require('benchmark').Suite)
).on(
	'complete',
	event => {
		let results = Array.from(event.currentTarget, (result, i) => Object.defineProperty(result, 'tokens', { value: tokenList[i] }))
		let { hz: prdHz, name: prdName, tokens: prdTokens } = results[0]
		results.sort((a, b) => b.hz - a.hz)
		let longestName = results.slice().sort((a, b) => b.name.length - a.name.length).shift().name
		let slowestHz = results.slice().pop().hz
		write('\n')
		results.forEach(({ hz, name, tokens }) => {
			write(`${name}: ${indent(longestName, name)}${indent(tokens.length, prdTokens)}${tokens.length} tokens in ${indent(mstime(slowestHz), mstime(hz))}${mstime(hz)}`)
			if (name !== prdName) {
				if (hz > prdHz) write(` (${(hz / prdHz).toFixed(1)} times faster)`)
				else write(` (${(prdHz / hz).toFixed(1)} times slower)`)
			}
			write('\n')
		})
		write('\n')
	}
).run()
