
let { mkdirSync, readFileSync, writeFileSync } = require('fs')
let { join } = require('path')

let tokenizePrd = require('postcss/lib/tokenize')
let tokenizeDev = require('../tokenize')

let bootstrapCSSPath = require.resolve('bootstrap/dist/css/bootstrap.css')
let bootstrapCSS = readFileSync(bootstrapCSSPath, 'utf8')

let types = {
	0x0009:    'SPACE', // ␠ ===  32
	0x0022:   'STRING', // " ===  34
	0x0030:   'NUMBER', // 0 ===  48
	0x0041:       'AT', // A ===  65
	0x0043:  'COMMENT', // C ===  67
	0x0046: 'FUNCTION', // F ===  70
	0x0048:     'HASH', // H ===  72
	0x004E:     'NAME', // N ===  78
}

Object.entries({
	'postcss-tokenize-7_0_30.json': () => {
		let tokenized = tokenizePrd({ css: bootstrapCSS })
		let tokens = []
		while (!tokenized.endOfFile()) tokens.push(tokenized.nextToken())
		return tokens
	},
	'cssom-tokenize.json': () => {
		let tokens = []
		tokenizeDev(bootstrapCSS, (type, line, cols, open, shut, lead, tail) => {
			tokens.push({
				type: types[type] || 'DELIMITER',
				line: line,
				col: cols,
				leadCSS: bootstrapCSS.slice(open, open + lead),
				mainCSS: bootstrapCSS.slice(open + lead, shut - tail),
				tailCSS: bootstrapCSS.slice(shut - tail, shut)
			})
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
