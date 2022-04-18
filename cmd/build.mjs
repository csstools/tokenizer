import * as _ from './_.mjs'

const isWatch = process.argv.includes('--watch')

console.log(`Building...`)

_.rmdir('dist')
_.mkdir('dist')
_.copyFile('src/types/global/global.d.ts', 'dist/tokenize.d.ts')
_.spawnNode('cmd/build.post.mjs')
