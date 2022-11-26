import * as _ from './_.mjs'

console.log(`Building...`)

_.rmdir('dist')
_.mkdir('dist')

_.copyFile('src/tokenize.d.ts', 'dist/tokenize.d.ts')

_.spawnNode('cmd/build.post.mjs')
