import * as fs from 'fs'
import tokenize from './index'

const initializeTest = (title: string, cssSource: string) => () => {
	console.log(), console.log(`Testing Tokenizer with ${title}...`)

	let cssResult = ''
	let iterator = tokenize(cssSource)
	let iteration = iterator()
	let count = 0
	while (!iteration.done) {
		++count
		cssResult += iteration.value[2] + iteration.value[3] + iteration.value[4]
		iteration = iterator()
	}

	console.log(), console.log(`Finished Testing Tokenizer (consumed ${count} tokens).`)
	if (cssSource === cssResult) console.log(`Success! Tokens from ${title} matched the source CSS with perfect accuracy.`)
	else {
		let i = 0
		for (let l = Math.max(cssSource.length, cssResult.length); i < l; ++i) {
			if (cssSource[i] !== cssResult[i]) break
		}
		console.log('original', [cssSource.slice(Math.max(0, i - 50), i + 50)])
		console.log('modified', [cssResult.slice(Math.max(0, i - 50), i + 50)])
	}
	return cssSource === cssResult
}

const tests = [
	initializeTest('Bootstrap', fs.readFileSync('./node_modules/bootstrap/dist/css/bootstrap.css', 'utf-8')),
	initializeTest('Tailwind', fs.readFileSync('./node_modules/tailwindcss/dist/tailwind.css', 'utf-8')),
]

for (const test of tests) if (!test()) break

