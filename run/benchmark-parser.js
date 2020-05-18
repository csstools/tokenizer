let write = process.stdout.write.bind(process.stdout)
let indent = (a, b) => ' '.repeat(Math.abs(a.length - b.length))
let mstime = hz => `${Math.round((1 / hz) * 1000).toString()} ms`

let ParserPrd = require('postcss/lib/parser')
let parserDev = require('../parse')
let postcssSelectorParser = require('postcss-selector-parser')()
let { parse: postcssValuesParser } = require('postcss-values-parser')

let bootstrapCSSPath = require.resolve('bootstrap/dist/css/bootstrap.css')
let bootstrapCSS = require('fs').readFileSync(bootstrapCSSPath, 'utf8')

let tokenList = [[],[],[]]

write('\nCollecting PostCSS Parser Benchmarks...\n')

Object.entries({
	'PostCSS Parser 7.0.30': () => {
		let parsed = new ParserPrd({ css: bootstrapCSS }, { from: bootstrapCSSPath })
		parsed.parse()

		// hard-code the number of nodes parsed from start-parser.js
		// so as not to negatively skew the results of the combined parsers
		tokenList[0] = { length: 6240 }
	},
	'PostCSS + Selector + Value Parser': () => {
		let parsed = new ParserPrd({ css: bootstrapCSS }, { from: bootstrapCSSPath })
		parsed.parse()
		parsed.root.walk(node => {
			switch (node.type) {
				case 'decl':
					postcssValuesParser(node.value)
					break
				case 'rule':
					postcssSelectorParser.processSync(node.selector)
					break
			}
		})

		// hard-code the number of nodes parsed from start-parser.js
		// so as not to negatively skew the results of the combined parsers
		tokenList[1] = { length: 28491 }
	},
	'PostCSS Parser Dev': () => {
		parserDev(bootstrapCSS)

		// hard-code the number of nodes parsed from start-parser.js
		// so as not to negatively skew the results of the combined parsers
		tokenList[2] = { length: 56024 }
	}
}).reduce(
	(suite, [name, func]) => suite.add(name, func),
	new (require('benchmark').Suite)()
).on('complete', event => {
	let results = Array.from(event.currentTarget, (result, i) => Object.defineProperty(result, 'nodes', { value: tokenList[i] }))
	let { hz: prdHz, name: prdName } = results[0]
	results.sort((a, b) => b.hz - a.hz)
	let longestName = results.slice().sort((a, b) => b.name.length - a.name.length).shift().name
	let longestNodes = String(results.slice().sort((a, b) => b.nodes.length - a.nodes.length).shift().nodes.length)
	let slowestHz = results.slice().pop().hz
	write('\n')
	results.forEach(({ hz, name, nodes }) => {
		write(
			`${name}: ${indent(longestName, name)}${indent(
				longestNodes,
				String(nodes.length)
			)}${nodes.length} nodes in ${indent(
				mstime(slowestHz),
				mstime(hz)
			)}${mstime(hz)}`
		)
		if (name !== prdName) {
			if (hz > prdHz) write(` (${(hz / prdHz).toFixed(1)} times faster)`)
			else write(` (${(prdHz / hz).toFixed(1)} times slower)`)
		}
		write('\n')
	})
	write('\n')
}).run()
