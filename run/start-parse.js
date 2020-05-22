let { mkdirSync, readFileSync, writeFileSync } = require('fs')
let { join } = require('path')
let indent = (a, b) => ' '.repeat(Math.abs(a.length - b.length))

let ParserPrd = require('postcss/lib/parser')
let parserDev = require('../parse')
let postcssSelectorParser = require('postcss-selector-parser')
let { parse: postcssValuesParser } = require('postcss-values-parser')

let bootstrapCSSPath = require.resolve('bootstrap/dist/css/bootstrap.css')
let bootstrapCSS = readFileSync(bootstrapCSSPath, 'utf8')

Object.entries({
	'postcss-parse-7_0_30.json': () => {
		let parsed = new ParserPrd({ css: bootstrapCSS }, { from: bootstrapCSSPath })
		parsed.parse()
		parsed.root.length = clean(parsed.root)
		return parsed.root

		function clean(node) {
			let size = 1
			delete node.source
			delete node.parent
			if (node.nodes) {
				for (const child of node.nodes) {
					size += clean(child)
				}
			}
			return size
		}
	},
	'postcss-full-parse-7_0_30.json': () => {
		let parsed = new ParserPrd({ css: bootstrapCSS }, { from: bootstrapCSSPath })
		let size = 0
		parsed.parse()
		parsed.root.walk(node => {
			switch (node.type) {
				case 'decl':
					node.value = postcssValuesParser(node.value)
					size += clean(node.value)
					break
				case 'rule':
					let selector
					postcssSelectorParser(selectorRoot => {
						size += clean(selectorRoot)
						selector = selectorRoot
					}).processSync(node.selector)
					node.selector = selector
			}
		})
		parsed.root.length = size + clean(parsed.root)
		return parsed.root

		function clean(node) {
			let size = 1
			delete node._error
			delete node.source
			delete node.parent
			if (node.nodes) {
				for (const child of node.nodes) {
					size += clean(child)
				}
			}
			return size
		}
	},
	'cssom-parse.json': () => {
		let root = parserDev(bootstrapCSS)
		root.length = walk(root)
		return root
		function walk(node) {
			let size = 1
			if (node.nodes) for (let child of node.nodes) size += walk(child)
			return size
		}
	}
}).forEach(([ file, getTokens ]) => {
	let resultsDir = join(__dirname, '..', 'results')
	let resultsFile = join(resultsDir, file)
	let tokens = getTokens()
	mkdirSync(resultsDir, { recursive: true })
	writeFileSync(resultsFile, JSON.stringify(tokens, null, '  '))
	console.log(`Wrote ${tokens.length} nodes to ${file}.`)
})
