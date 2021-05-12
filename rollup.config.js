import * as cp from './src/lib/code-points.ts'
import * as tt from './src/lib/token-types.ts'
import * as path from 'path'
import { terser } from 'rollup-plugin-terser'
import babel from '@rollup/plugin-babel'
import bundleSize from 'rollup-plugin-bundle-size'
import MagicString from 'magic-string'

const babelOptions = {
	babelHelpers: 'bundled',
	extensions: ['.cjs', '.js', '.mjs', '.ts'],
}

const terserOptions = {
	ecma: 2020,
	compress: {
		global_defs: {
			...cp,
			...tt,
		},
	},
}

const resolveJsTsExtension = {
	name: 'resolve-js-ts-extension',
	resolveId(/** @type {string} */ importee, /** @type {string} */ importer) {
		if (importer?.endsWith('.ts') && importee) return path.join(path.dirname(importer), importee).replace(/(\.js)?$/, '.ts')
		return null
	}
}

const reduceImpact = {
	name: 'reduce-impact',
	renderChunk(code) {
		const str = new MagicString(code)
		str.trim(';').remove(0, 4)
		return {
			code: str.toString(),
			map: str.generateMap({ hires: true }),
		}
	}
}

const config = /** @type {import('rollup').NormalizedInputOptions[]} */ ([
	{
		input: './src/index.ts',
		output: {
			esModule: false,
			exports: 'named',
			file: './dist/index.mjs',
			format: 'esm',
			strict: true,
			sourcemap: true,
		},
		plugins: [
			resolveJsTsExtension,
			babel({ ...babelOptions }),
			bundleSize()
		],
	},
	{
		input: './src/index.ts',
		output: {
			esModule: false,
			exports: 'named',
			file: './dist/index.cjs',
			format: 'cjs',
			strict: true,
			sourcemap: true,
		},
		plugins: [
			resolveJsTsExtension,
			babel({ ...babelOptions }),
			bundleSize()
		],
	},
	{
		input: './src/index.iife.ts',
		output: {
			esModule: false,
			exports: 'default',
			file: './dist/index.js',
			format: 'iife',
			name: 'cssTokenizer',
			strict: false,
			sourcemap: false,
		},
		plugins: [
			resolveJsTsExtension,
			babel({ ...babelOptions }),
			terser({ ...terserOptions }),
			reduceImpact,
			bundleSize(),
		]
	}
])

export default config
