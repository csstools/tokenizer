import * as _ from './_.mjs'

const isWatch = process.argv.includes('--watch')

console.log(`Starting compilation...`)
_.rmdir('dist')

if (isWatch) _.spawnTscWatch([ '--build', '--onSuccess', 'node cmd/benchmark.post.mjs' ])
else {
	_.spawnTsc([ '--build' ])
	_.spawnNode('cmd/benchmark.post.mjs')
}
