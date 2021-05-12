import * as fs from 'fs'
import * as path from 'path'
import * as process from 'child_process'
import * as readline from 'readline'
import * as url from 'url'

export const __dirname = path.resolve(url.fileURLToPath(import.meta.url), '..', '..')
export const __bin     = path.resolve('node_modules', '.bin')
export const __dist    = path.resolve('dist')
export const __modules = path.resolve('node_modules')

export const resolve = (...paths) => path.resolve(__dirname, ...paths)

export const spawn         = (cmd, args, opts) => process.spawnSync(cmd, args, { cwd: __dirname, stdio: 'inherit', ...Object(opts) })
export const spawnNode     = (cmd, args, opts) => spawn('node', [path.resolve(cmd), ...Array.from(Object(args))], opts)
export const spawnTsc      = (args, opts) => spawnNode('node_modules/typescript/lib/tsc.js', args, opts)
export const spawnTscWatch = (args, opts) => spawnNode('node_modules/tsc-watch/lib/tsc-watch.js', args, opts)

export const rmdir = (...paths) => (fs.rmSync || fs.rmdirSync)(resolve(...paths), { force: true, recursive: true })

export const question = query => new Promise(resolve => {
	const rl = readline.createInterface(question.options)
	rl.question('major / minor / patch? ', answer => {
		rl.close()
		resolve(answer)
	})
})

question.options = {}
