import * as _ from './_.mjs'

_.rmdir('dist/lib')
_.spawnNode('dist/src/index.benchmark.js')
