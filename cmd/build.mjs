import * as _ from './_.mjs'

const isWatch = process.argv.includes('--watch')

console.log(`Starting compilation...`)
_.rmdir('dist')

if (isWatch) _.spawnTscWatch([ '--build', 'tsconfig.json.build.json', '--onSuccess', 'node cmd/build.post.mjs' ])
else {
	_.spawnTsc([ '--build', 'tsconfig.json.build.json' ])
	_.spawnNode('cmd/build.post.mjs')
}
