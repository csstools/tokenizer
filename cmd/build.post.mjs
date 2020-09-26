import * as _ from './_.mjs'

console.log()
_.rmdir('dist/lib')
_.spawnNode('node_modules/rollup/dist/bin/rollup', ['--config', '--silent'])
