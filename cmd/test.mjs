import * as _ from './_.mjs'

const isWatch = process.argv.includes('--watch')

const jestBin = 'node_modules/jest/bin/jest.js'

console.log(`Starting testing...`)
console.log()

_.rmdir('coverage')

_.spawnNode(jestBin, [
	'--colors',
	'--passWithNoTests',
	...(isWatch ? ['--watchAll'] : [])
])
