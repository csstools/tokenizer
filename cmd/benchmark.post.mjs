import * as _ from './_.mjs'

_.rmdir('dist')

_.spawnTsc(['src/tokenize.benchmark.ts', '--downlevelIteration', '--esModuleInterop', '--skipLibCheck', '--outDir', 'dist', '--module', 'ESNext', '--moduleResolution', 'node'])

_.spawnNode('dist/tokenize.benchmark.js')

_.rmdir('dist')
