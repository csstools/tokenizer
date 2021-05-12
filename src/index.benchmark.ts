import * as fs from 'fs'
import Benchmark from 'benchmark'
import tokenizerPostCSS from 'postcss/lib/tokenize.js'
import tokenizerDevelop from './index.js'

const counter = { value: 0 }

export declare type Suite = Omit<Benchmark.Suite, 'filter'> & {
	filter(callback: string): Suite[]
	hz: number
	name: string
	tokensCount: number
}

const createCasePostCSS = (css: string) => () => {
	let count = 0
	const tokenizer = tokenizerPostCSS({ css })
	while (!tokenizer.endOfFile()) {
		tokenizer.nextToken()
		++count
	}
	counter.value = count
}

const createCaseDevelop = (css: string) => () => {
	let count = 1
	let tokenizer = tokenizerDevelop(css)
	while (!tokenizer().done) ++count
	counter.value = count
}

const initializeBenchmark = (suite: Suite, css: string) => {
	counter.value = 0

	suite.add('PostCSS', createCasePostCSS(css))
	suite.add('Develop', createCaseDevelop(css))
	suite.on('cycle', (evt: { target: { tokensCount: number }}) => evt.target.tokensCount = counter.value)
	suite.on('complete', () => {
		const result: { [key: string]: { ms: number, 'ms/50k': number, tokens: number } } = {}
		const successful = Array.from(suite.filter('successful'))

		successful.forEach(target => {
			const ms = 1 / target.hz * 1000
			result[target.toString()] = {
				'ms':     Number(ms.toFixed(2)),
				'ms/50k': Number(((50e3 * ms) / target.tokensCount).toFixed(2)),
				'tokens': target.tokensCount,
			}
		})

		console.log()
		console.group('Benchmark:', suite.name)
		console.table(result)
		console.groupEnd()
	})

	return suite
}

const cssBootstrap = fs.readFileSync('./node_modules/bootstrap/dist/css/bootstrap.css', 'utf-8')
const cssTailwind = fs.readFileSync('./node_modules/tailwindcss/dist/tailwind.css', 'utf-8')

const suiteBootstrap = initializeBenchmark(new Benchmark.Suite('Bootstrap') as unknown as Suite, cssBootstrap)
const suiteTailwind = initializeBenchmark(new Benchmark.Suite('Tailwind CSS') as unknown as Suite, cssTailwind)

console.log()
console.log('Starting benchmarking...')

suiteTailwind.run()
suiteBootstrap.run()

console.log()
console.log('Finished benchmarking.')
