import { CSSToken } from './types/global/global.js'
import * as fs from 'fs'
import { tokenize } from './tokenize.js'

describe('Tokenization', () => {
	test('Tokenizing an empty value', () => {
		let sourceCSS = ''
		let resultCSS = ''
		let iterator = tokenize(sourceCSS)
		let iteration
		while (!(iteration = iterator()).done) {
			resultCSS += iteration.value.lead + iteration.value.data + iteration.value.tail
		}
		expect(sourceCSS).toBe(resultCSS)
	})

	test('Tokenizing a broken comment', () => {
		let sourceCSS = '/* '
		let resultCSS = ''
		let iterator = tokenize(sourceCSS)
		let iteration
		let count = 0
		while (!(iteration = iterator()).done) {
			resultCSS += iteration.value.lead + iteration.value.data + iteration.value.tail
			++count
		}
		expect(sourceCSS).toBe(resultCSS)
		expect(count).toBe(1)
	})

	test('Tokenizing usual values', () => {
		expect(Array.from(tokenize(`/**/`))).toHaveLength(1)
		expect(Array.from(tokenize(`/* */`))).toHaveLength(1)
		expect(Array.from(tokenize(`/***/`))).toHaveLength(1)
		expect(Array.from(tokenize(`/** */`))).toHaveLength(1)
		expect(Array.from(tokenize(`/* **/`))).toHaveLength(1)
		expect(Array.from(tokenize(`/*/**/`))).toHaveLength(1)

		expect(Array.from(tokenize(` \n \t \f   `))).toHaveLength(1)

		expect(Array.from(tokenize(`"hello"` + `'hello'`))).toHaveLength(2)
		expect(Array.from(tokenize(`"\\"hello"` + `'\\'hello'` + `"hello\\""` + `'hello\\''`))).toHaveLength(4)
		expect(Array.from(tokenize(`"h\\"ello"` + `'h\\'ello'` + `"hell\\"o"` + `'hell\\'o'`))).toHaveLength(4)
		expect(Array.from(tokenize(`"\\\nhello"` + `'\\\nhello'` + `"hello\\\n"` + `'hello\\\n'`))).toHaveLength(4)
		expect(Array.from(tokenize(`"h\\\nello"` + `'h\\\nello'` + `"hell\\\no"` + `'hell\\\no'`))).toHaveLength(4)

		expect(Array.from(tokenize(`#_` + `#™` + `#A` + `#E` + `#Z` + `#a` + `#e` + `#z`))).toHaveLength(8)

		expect(Array.from(tokenize(`0`))).toHaveLength(1)
		expect(Array.from(tokenize(`+0`))).toHaveLength(1)
		expect(Array.from(tokenize(`-0`))).toHaveLength(1)
		expect(Array.from(tokenize(`.0`))).toHaveLength(1)
		expect(Array.from(tokenize(`+.0`))).toHaveLength(1)
		expect(Array.from(tokenize(`-.0`))).toHaveLength(1)
		expect(Array.from(tokenize(`1em`))).toHaveLength(1)
		expect(Array.from(tokenize(`+1em`))).toHaveLength(1)
		expect(Array.from(tokenize(`-1em`))).toHaveLength(1)
		expect(Array.from(tokenize(`.1em`))).toHaveLength(1)
		expect(Array.from(tokenize(`+.1em`))).toHaveLength(1)
		expect(Array.from(tokenize(`-.1em`))).toHaveLength(1)

		expect(Array.from(tokenize(`0%`))).toHaveLength(1)
		expect(Array.from(tokenize(`+0%`))).toHaveLength(1)
		expect(Array.from(tokenize(`-0%`))).toHaveLength(1)
		expect(Array.from(tokenize(`.0%`))).toHaveLength(1)
		expect(Array.from(tokenize(`+.0%`))).toHaveLength(1)
		expect(Array.from(tokenize(`-.0%`))).toHaveLength(1)
		expect(Array.from(tokenize(`1%`))).toHaveLength(1)
		expect(Array.from(tokenize(`+1%`))).toHaveLength(1)
		expect(Array.from(tokenize(`-1%`))).toHaveLength(1)
		expect(Array.from(tokenize(`.1%`))).toHaveLength(1)
		expect(Array.from(tokenize(`+.1%`))).toHaveLength(1)
		expect(Array.from(tokenize(`-.1%`))).toHaveLength(1)
	})

	test('Tokenizing delimiters', () => {
		expect(Array.from(tokenize(`*`))).toHaveLength(1)
		expect(Array.from(tokenize(`.`))).toHaveLength(1)
		expect(Array.from(tokenize(`#`))).toHaveLength(1)
		expect(Array.from(tokenize(`@`))).toHaveLength(1)
	})

	test('Tokenizing unusual beginnings', () => {
		expect(Array.from(tokenize(`@_` + `@™` + `@A` + `@E` + `@Z` + `@a` + `@e` + `@z`))).toHaveLength(8)
		expect(Array.from(tokenize(`@-_` + `@-™` + `@-A` + `@-E` + `@-Z` + `@-a` + `@-e` + `@-z`))).toHaveLength(8)

		expect(Array.from(tokenize(`--`))).toHaveLength(1)
		expect(Array.from(tokenize(`@--`))).toHaveLength(1)

		expect(Array.from(tokenize(`\\^-_` + `#\\^-_` + `@\\^-_`))).toHaveLength(3)
		expect(Array.from(tokenize(`-\\^-_` + `#-\\^-_` + `@-\\^-_`))).toHaveLength(3)
		expect(Array.from(tokenize(`-A\\^-_` + `#A\\^-_` + `@A-\\^-_`))).toHaveLength(3)
	})

	test('Tokenizing unusual numbers', () => {
		let tokens: CSSToken[]

		tokens = Array.from(tokenize(`1em`))
		expect(tokens).toHaveLength(1)

		tokens = [
			...Array.from(tokenize(`.25rem`)),
		]
		expect(tokens).toHaveLength(1)

		tokens = [
			...Array.from(tokenize(`1_`)),
			...Array.from(tokenize(`1™`)),
			...Array.from(tokenize(`1A`)),
			...Array.from(tokenize(`1E`)),
			...Array.from(tokenize(`1Z`)),
			...Array.from(tokenize(`1a`)),
			...Array.from(tokenize(`1e`)),
			...Array.from(tokenize(`1z`)),
		]
		expect(tokens).toHaveLength(8)
		tokens = [
			...Array.from(tokenize(`1-_`)),
			...Array.from(tokenize(`1-™`)),
			...Array.from(tokenize(`1-A`)),
			...Array.from(tokenize(`1-E`)),
			...Array.from(tokenize(`1-Z`)),
			...Array.from(tokenize(`1-a`)),
			...Array.from(tokenize(`1-e`)),
			...Array.from(tokenize(`1-z`)),
		]
		expect(tokens).toHaveLength(8)
		tokens = [
			...Array.from(tokenize(`1\\^-_`)),
			...Array.from(tokenize(`1-\\^-_`)),
		]
		expect(tokens).toHaveLength(2)

		expect(Array.from(tokenize(`1--`))).toHaveLength(1)
		expect(Array.from(tokenize(`1\\^`))).toHaveLength(1)

		expect(Array.from(tokenize(`1e1em`))).toHaveLength(1)
		expect(Array.from(tokenize(`1e+1em`))).toHaveLength(1)
		expect(Array.from(tokenize(`1e-1em`))).toHaveLength(1)
		expect(Array.from(tokenize(`+1em`))).toHaveLength(1)
		expect(Array.from(tokenize(`+1e5em`))).toHaveLength(1)
		expect(Array.from(tokenize(`-1em`))).toHaveLength(1)
		expect(Array.from(tokenize(`-1e5em`))).toHaveLength(1)
		expect(Array.from(tokenize(`.1em`))).toHaveLength(1)
		expect(Array.from(tokenize(`+.1em`))).toHaveLength(1)
		expect(Array.from(tokenize(`-.1em`))).toHaveLength(1)
	})

	test('Tokenizing unusual breaks', () => {
		expect(Array.from(tokenize(`@\n`))).toHaveLength(2)
		expect(Array.from(tokenize(`@\\\n`))).toHaveLength(3)
		expect(Array.from(tokenize(`@A\n`))).toHaveLength(2)
		expect(Array.from(tokenize(`@A\\\n`))).toHaveLength(3)
		expect(Array.from(tokenize(`@-\n`))).toHaveLength(3)
		expect(Array.from(tokenize(`@-\\\n`))).toHaveLength(4)

		expect(Array.from(tokenize(`1` + `\n`))).toHaveLength(2)
		expect(Array.from(tokenize(`1` + `\\` + `\n`))).toHaveLength(3)
		expect(Array.from(tokenize(`1` + `-` + `\n`))).toHaveLength(3)
		expect(Array.from(tokenize(`1` + `-` + `\\` + `\n`))).toHaveLength(4)

		expect(Array.from(tokenize(`-` + `.`))).toHaveLength(2)
		expect(Array.from(tokenize(`-` + `.` + `+8`))).toHaveLength(3)
		expect(Array.from(tokenize(`+` + `.` + `-8`))).toHaveLength(3)
		expect(Array.from(tokenize(`8e` + `+` + `-`))).toHaveLength(3)
		expect(Array.from(tokenize(`8e-` + `+`))).toHaveLength(2)
	})
})

describe('Library accuracy', () => {
	test('Bootstrap', () => {
		let sourceCSS = fs.readFileSync('./node_modules/bootstrap/dist/css/bootstrap.css', 'utf-8')
		let resultCSS = ''
		let iterator = tokenize(sourceCSS)
		let iteration
		while (!(iteration = iterator()).done) {
			resultCSS += iteration.value.lead + iteration.value.data + iteration.value.tail
		}
		expect(sourceCSS).toBe(resultCSS)
	})

	test('Bootstrap [Symbol.iterator]', () => {
		let sourceCSS = fs.readFileSync('./node_modules/bootstrap/dist/css/bootstrap.css', 'utf-8')
		let resultCSS = Array.from(tokenize(sourceCSS), token => token.lead + token.data + token.tail).join('')
		expect(sourceCSS).toBe(resultCSS)
	})

	test('Tailwind CSS', () => {
		let sourceCSS = fs.readFileSync('./node_modules/tailwindcss/dist/tailwind.css', 'utf-8')
		let resultCSS = ''
		let iterator = tokenize(sourceCSS)
		let iteration
		while (!(iteration = iterator()).done) {
			resultCSS += iteration.value.lead + iteration.value.data + iteration.value.tail
		}
		expect(sourceCSS).toBe(resultCSS)
	})

	test('Tailwind CSS [Symbol.iterator]', () => {
		let sourceCSS = fs.readFileSync('./node_modules/tailwindcss/dist/tailwind.css', 'utf-8')
		let resultCSS = Array.from(tokenize(sourceCSS), token => token.lead + token.data + token.tail).join('')
		expect(sourceCSS).toBe(resultCSS)
	})
})
