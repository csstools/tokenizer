import * as fs from 'fs'
import { tokenizer } from './index.js'

describe('Tokenization', () => {
	test('Tokenizing an empty value', () => {
		let sourceCSS = ''
		let resultCSS = ''
		let iterator = tokenizer(sourceCSS)
		let iteration
		while (!(iteration = iterator()).done) {
			resultCSS += iteration.value[2] + iteration.value[3] + iteration.value[4]
		}
		expect(sourceCSS).toBe(resultCSS)
	})

	test('Tokenizing a broken comment', () => {
		let sourceCSS = '/* '
		let resultCSS = ''
		let iterator = tokenizer(sourceCSS)
		let iteration
		let count = 0
		while (!(iteration = iterator()).done) {
			resultCSS += iteration.value[2] + iteration.value[3] + iteration.value[4]
			++count
		}
		expect(sourceCSS).toBe(resultCSS)
		expect(count).toBe(1)
	})

	test('Tokenizing usual values', () => {
		expect(Array.from(tokenizer(`/**/`))).toHaveLength(1)
		expect(Array.from(tokenizer(`/* */`))).toHaveLength(1)
		expect(Array.from(tokenizer(`/***/`))).toHaveLength(1)
		expect(Array.from(tokenizer(`/** */`))).toHaveLength(1)
		expect(Array.from(tokenizer(`/* **/`))).toHaveLength(1)
		expect(Array.from(tokenizer(`/*/**/`))).toHaveLength(1)

		expect(Array.from(tokenizer(` \n \t \f   `))).toHaveLength(1)

		expect(Array.from(tokenizer(`"hello"` + `'hello'`))).toHaveLength(2)
		expect(Array.from(tokenizer(`"\\"hello"` + `'\\'hello'` + `"hello\\""` + `'hello\\''`))).toHaveLength(4)
		expect(Array.from(tokenizer(`"h\\"ello"` + `'h\\'ello'` + `"hell\\"o"` + `'hell\\'o'`))).toHaveLength(4)
		expect(Array.from(tokenizer(`"\\\nhello"` + `'\\\nhello'` + `"hello\\\n"` + `'hello\\\n'`))).toHaveLength(4)
		expect(Array.from(tokenizer(`"h\\\nello"` + `'h\\\nello'` + `"hell\\\no"` + `'hell\\\no'`))).toHaveLength(4)

		expect(Array.from(tokenizer(`#_` + `#™` + `#A` + `#E` + `#Z` + `#a` + `#e` + `#z`))).toHaveLength(8)

		expect(Array.from(tokenizer(`0`))).toHaveLength(1)
		expect(Array.from(tokenizer(`+0`))).toHaveLength(1)
		expect(Array.from(tokenizer(`-0`))).toHaveLength(1)
		expect(Array.from(tokenizer(`.0`))).toHaveLength(1)
		expect(Array.from(tokenizer(`+.0`))).toHaveLength(1)
		expect(Array.from(tokenizer(`-.0`))).toHaveLength(1)
		expect(Array.from(tokenizer(`1em`))).toHaveLength(1)
		expect(Array.from(tokenizer(`+1em`))).toHaveLength(1)
		expect(Array.from(tokenizer(`-1em`))).toHaveLength(1)
		expect(Array.from(tokenizer(`.1em`))).toHaveLength(1)
		expect(Array.from(tokenizer(`+.1em`))).toHaveLength(1)
		expect(Array.from(tokenizer(`-.1em`))).toHaveLength(1)
	})

	test('Tokenizing delimiters', () => {
		expect(Array.from(tokenizer(`*`))).toHaveLength(1)
		expect(Array.from(tokenizer(`.`))).toHaveLength(1)
		expect(Array.from(tokenizer(`#`))).toHaveLength(1)
		expect(Array.from(tokenizer(`@`))).toHaveLength(1)
	})

	test('Tokenizing unusual beginnings', () => {
		expect(Array.from(tokenizer(`@_` + `@™` + `@A` + `@E` + `@Z` + `@a` + `@e` + `@z`))).toHaveLength(8)
		expect(Array.from(tokenizer(`@-_` + `@-™` + `@-A` + `@-E` + `@-Z` + `@-a` + `@-e` + `@-z`))).toHaveLength(8)

		expect(Array.from(tokenizer(`--`))).toHaveLength(1)
		expect(Array.from(tokenizer(`@--`))).toHaveLength(1)

		expect(Array.from(tokenizer(`\\^-_` + `#\\^-_` + `@\\^-_`))).toHaveLength(3)
		expect(Array.from(tokenizer(`-\\^-_` + `#-\\^-_` + `@-\\^-_`))).toHaveLength(3)
		expect(Array.from(tokenizer(`-A\\^-_` + `#A\\^-_` + `@A-\\^-_`))).toHaveLength(3)
	})

	test('Tokenizing unusual numbers', () => {
		let tokens: CSSValue[]

		tokens = Array.from(tokenizer(`1em`))
		expect(tokens).toHaveLength(1)

		tokens = [
			...Array.from(tokenizer(`.25rem`)),
		]
		expect(tokens).toHaveLength(1)

		tokens = [
			...Array.from(tokenizer(`1_`)),
			...Array.from(tokenizer(`1™`)),
			...Array.from(tokenizer(`1A`)),
			...Array.from(tokenizer(`1E`)),
			...Array.from(tokenizer(`1Z`)),
			...Array.from(tokenizer(`1a`)),
			...Array.from(tokenizer(`1e`)),
			...Array.from(tokenizer(`1z`)),
		]
		expect(tokens).toHaveLength(8)
		tokens = [
			...Array.from(tokenizer(`1-_`)),
			...Array.from(tokenizer(`1-™`)),
			...Array.from(tokenizer(`1-A`)),
			...Array.from(tokenizer(`1-E`)),
			...Array.from(tokenizer(`1-Z`)),
			...Array.from(tokenizer(`1-a`)),
			...Array.from(tokenizer(`1-e`)),
			...Array.from(tokenizer(`1-z`)),
		]
		expect(tokens).toHaveLength(8)
		tokens = [
			...Array.from(tokenizer(`1\\^-_`)),
			...Array.from(tokenizer(`1-\\^-_`)),
		]
		expect(tokens).toHaveLength(2)

		expect(Array.from(tokenizer(`1--`))).toHaveLength(1)
		expect(Array.from(tokenizer(`1\\^`))).toHaveLength(1)

		expect(Array.from(tokenizer(`1e1em`))).toHaveLength(1)
		expect(Array.from(tokenizer(`1e+1em`))).toHaveLength(1)
		expect(Array.from(tokenizer(`1e-1em`))).toHaveLength(1)
		expect(Array.from(tokenizer(`+1em`))).toHaveLength(1)
		expect(Array.from(tokenizer(`+1e5em`))).toHaveLength(1)
		expect(Array.from(tokenizer(`-1em`))).toHaveLength(1)
		expect(Array.from(tokenizer(`-1e5em`))).toHaveLength(1)
		expect(Array.from(tokenizer(`.1em`))).toHaveLength(1)
		expect(Array.from(tokenizer(`+.1em`))).toHaveLength(1)
		expect(Array.from(tokenizer(`-.1em`))).toHaveLength(1)
	})

	test('Tokenizing unusual breaks', () => {
		expect(Array.from(tokenizer(`@\n`))).toHaveLength(2)
		expect(Array.from(tokenizer(`@\\\n`))).toHaveLength(3)
		expect(Array.from(tokenizer(`@A\n`))).toHaveLength(2)
		expect(Array.from(tokenizer(`@A\\\n`))).toHaveLength(3)
		expect(Array.from(tokenizer(`@-\n`))).toHaveLength(3)
		expect(Array.from(tokenizer(`@-\\\n`))).toHaveLength(4)

		expect(Array.from(tokenizer(`1` + `\n`))).toHaveLength(2)
		expect(Array.from(tokenizer(`1` + `\\` + `\n`))).toHaveLength(3)
		expect(Array.from(tokenizer(`1` + `-` + `\n`))).toHaveLength(3)
		expect(Array.from(tokenizer(`1` + `-` + `\\` + `\n`))).toHaveLength(4)

		expect(Array.from(tokenizer(`-` + `.`))).toHaveLength(2)
		expect(Array.from(tokenizer(`-` + `.` + `+8`))).toHaveLength(3)
		expect(Array.from(tokenizer(`+` + `.` + `-8`))).toHaveLength(3)
		expect(Array.from(tokenizer(`8e` + `+` + `-`))).toHaveLength(3)
		expect(Array.from(tokenizer(`8e-` + `+`))).toHaveLength(2)
	})
})

describe('Library accuracy', () => {
	test('Bootstrap', () => {
		let sourceCSS = fs.readFileSync('./node_modules/bootstrap/dist/css/bootstrap.css', 'utf-8')
		let resultCSS = ''
		let iterator = tokenizer(sourceCSS)
		let iteration
		while (!(iteration = iterator()).done) {
			resultCSS += iteration.value[2] + iteration.value[3] + iteration.value[4]
		}
		expect(sourceCSS).toBe(resultCSS)
	})

	test('Bootstrap [Symbol.iterator]', () => {
		let sourceCSS = fs.readFileSync('./node_modules/bootstrap/dist/css/bootstrap.css', 'utf-8')
		let resultCSS = Array.from(tokenizer(sourceCSS), token => token[2] + token[3] + token[4]).join('')
		expect(sourceCSS).toBe(resultCSS)
	})

	test('Tailwind CSS', () => {
		let sourceCSS = fs.readFileSync('./node_modules/tailwindcss/dist/tailwind.css', 'utf-8')
		let resultCSS = ''
		let iterator = tokenizer(sourceCSS)
		let iteration
		while (!(iteration = iterator()).done) {
			resultCSS += iteration.value[2] + iteration.value[3] + iteration.value[4]
		}
		expect(sourceCSS).toBe(resultCSS)
	})

	test('Tailwind CSS [Symbol.iterator]', () => {
		let sourceCSS = fs.readFileSync('./node_modules/tailwindcss/dist/tailwind.css', 'utf-8')
		let resultCSS = Array.from(tokenizer(sourceCSS), token => token[2] + token[3] + token[4]).join('')
		expect(sourceCSS).toBe(resultCSS)
	})
})
