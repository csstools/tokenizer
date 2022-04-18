import { CSSToken } from './types/global/global.js'
import * as fs from 'fs'
import { tokenize } from './tokenize.js'

const getTailIndex = (token: CSSToken) => token.lead + token.data + token.edge
const getLeadIndex = (token: CSSToken) => token.lead
const getTokenString = (string: string, token: CSSToken) => string.slice(getLeadIndex(token), getTailIndex(token))
const getTokenArray = (string: string) => {
	let array = []
	tokenize(string, array.push.bind(array))
	return array
}

describe('Tokenization', () => {
	test('Tokenizing an empty value', () => {
		let sourceCSS = ''
		let resultCSS = ''
		tokenize(sourceCSS, token => {
			resultCSS += getTokenString(sourceCSS, token)
		})
		expect(sourceCSS).toBe(resultCSS)
	})

	test('Tokenizing a broken comment', () => {
		let sourceCSS = '/* '
		let resultCSS = ''
		let count = 0
		tokenize(sourceCSS, (token) => {
			resultCSS += getTokenString(sourceCSS, token)
			++count
		})
		expect(sourceCSS).toBe(resultCSS)
		expect(count).toBe(1)
	})

	test('Tokenizing usual values', () => {
		expect(getTokenArray(`/**/`)).toHaveLength(1)
		expect(getTokenArray(`/* */`)).toHaveLength(1)
		expect(getTokenArray(`/***/`)).toHaveLength(1)
		expect(getTokenArray(`/** */`)).toHaveLength(1)
		expect(getTokenArray(`/* **/`)).toHaveLength(1)
		expect(getTokenArray(`/*/**/`)).toHaveLength(1)

		expect(getTokenArray(` \n \t \f   `)).toHaveLength(1)

		expect(getTokenArray(`"hello"` + `'hello'`)).toHaveLength(2)
		expect(getTokenArray(`"\\"hello"` + `'\\'hello'` + `"hello\\""` + `'hello\\''`)).toHaveLength(4)
		expect(getTokenArray(`"h\\"ello"` + `'h\\'ello'` + `"hell\\"o"` + `'hell\\'o'`)).toHaveLength(4)
		expect(getTokenArray(`"\\\nhello"` + `'\\\nhello'` + `"hello\\\n"` + `'hello\\\n'`)).toHaveLength(4)
		expect(getTokenArray(`"h\\\nello"` + `'h\\\nello'` + `"hell\\\no"` + `'hell\\\no'`)).toHaveLength(4)

		expect(getTokenArray(`!`)).toHaveLength(1)
		expect(getTokenArray(`/`)).toHaveLength(1)
		expect(getTokenArray(`/ / `)).toHaveLength(4)
		expect(getTokenArray(`#_` + `#™` + `#A` + `#E` + `#Z` + `#a` + `#e` + `#z`)).toHaveLength(8)

		expect(getTokenArray(`123`)).toHaveLength(1)
		expect(getTokenArray(`+123`)).toHaveLength(1)
		expect(getTokenArray(`-123`)).toHaveLength(1)
		expect(getTokenArray(`+.123`)).toHaveLength(1)
		expect(getTokenArray(`-.123`)).toHaveLength(1)
		expect(getTokenArray(`123`)).toHaveLength(1)
		expect(getTokenArray(`+123`)).toHaveLength(1)
		expect(getTokenArray(`-123`)).toHaveLength(1)
		expect(getTokenArray(`.123`)).toHaveLength(1)
		expect(getTokenArray(`+.123`)).toHaveLength(1)
		expect(getTokenArray(`-.123`)).toHaveLength(1)
		expect(getTokenArray(`12.34`)).toHaveLength(1)
		expect(getTokenArray(`-12.34`)).toHaveLength(1)
		expect(getTokenArray(`+12.34`)).toHaveLength(1)

		expect(getTokenArray(`1em`)).toHaveLength(1)
		expect(getTokenArray(`+1em`)).toHaveLength(1)
		expect(getTokenArray(`-1em`)).toHaveLength(1)
		expect(getTokenArray(`.1em`)).toHaveLength(1)
		expect(getTokenArray(`+.1em`)).toHaveLength(1)
		expect(getTokenArray(`-.1em`)).toHaveLength(1)

		expect(getTokenArray(`0%`)).toHaveLength(1)
		expect(getTokenArray(`+0%`)).toHaveLength(1)
		expect(getTokenArray(`-0%`)).toHaveLength(1)
		expect(getTokenArray(`.0%`)).toHaveLength(1)
		expect(getTokenArray(`+.0%`)).toHaveLength(1)
		expect(getTokenArray(`-.0%`)).toHaveLength(1)
		expect(getTokenArray(`1%`)).toHaveLength(1)
		expect(getTokenArray(`+1%`)).toHaveLength(1)
		expect(getTokenArray(`-1%`)).toHaveLength(1)
		expect(getTokenArray(`.1%`)).toHaveLength(1)
		expect(getTokenArray(`+.1%`)).toHaveLength(1)
		expect(getTokenArray(`-.1%`)).toHaveLength(1)
	})

	test('Tokenizing delimiters', () => {
		expect(getTokenArray(`*`)).toHaveLength(1)
		expect(getTokenArray(`.`)).toHaveLength(1)
		expect(getTokenArray(`#`)).toHaveLength(1)
		expect(getTokenArray(`@`)).toHaveLength(1)
	})

	test('Tokenizing unusual identifiers', () => {
		expect(getTokenArray(`😅`)).toHaveLength(1)
		expect(getTokenArray(`😅(`)).toHaveLength(1)
	})

	test('Tokenizing unusual beginnings', () => {
		expect(getTokenArray(`@_` + `@™` + `@A` + `@E` + `@Z` + `@a` + `@e` + `@z`)).toHaveLength(8)
		expect(getTokenArray(`@-_` + `@-™` + `@-A` + `@-E` + `@-Z` + `@-a` + `@-e` + `@-z`)).toHaveLength(8)

		expect(getTokenArray(`--`)).toHaveLength(1)
		expect(getTokenArray(`@--`)).toHaveLength(1)

		expect(getTokenArray(`\\^-_` + `#\\^-_` + `@\\^-_`)).toHaveLength(3)
		expect(getTokenArray(`-\\^-_` + `#-\\^-_` + `@-\\^-_`)).toHaveLength(3)
		expect(getTokenArray(`-A\\^-_` + `#A\\^-_` + `@A-\\^-_`)).toHaveLength(3)
	})

	test('Tokenizing unusual numbers', () => {
		let tokens: CSSToken[]

		tokens = getTokenArray(`1em`)
		expect(tokens).toHaveLength(1)

		tokens = [
			...getTokenArray(`.25rem`),
		]
		expect(tokens).toHaveLength(1)

		tokens = [
			...getTokenArray(`1_`),
			...getTokenArray(`1™`),
			...getTokenArray(`1A`),
			...getTokenArray(`1E`),
			...getTokenArray(`1Z`),
			...getTokenArray(`1a`),
			...getTokenArray(`1e`),
			...getTokenArray(`1z`),
		]
		expect(tokens).toHaveLength(8)
		tokens = [
			...getTokenArray(`1-_`),
			...getTokenArray(`1-™`),
			...getTokenArray(`1-A`),
			...getTokenArray(`1-E`),
			...getTokenArray(`1-Z`),
			...getTokenArray(`1-a`),
			...getTokenArray(`1-e`),
			...getTokenArray(`1-z`),
		]
		expect(tokens).toHaveLength(8)
		tokens = [
			...getTokenArray(`1\\^-_`),
			...getTokenArray(`1-\\^-_`),
		]
		expect(tokens).toHaveLength(2)

		expect(getTokenArray(`1--`)).toHaveLength(1)
		expect(getTokenArray(`1\\^`)).toHaveLength(1)

		expect(getTokenArray(`1e1em`)).toHaveLength(1)
		expect(getTokenArray(`1e+1em`)).toHaveLength(1)
		expect(getTokenArray(`1e-1em`)).toHaveLength(1)
		expect(getTokenArray(`+1em`)).toHaveLength(1)
		expect(getTokenArray(`+1e5em`)).toHaveLength(1)
		expect(getTokenArray(`-1em`)).toHaveLength(1)
		expect(getTokenArray(`-1e5em`)).toHaveLength(1)
		expect(getTokenArray(`.1em`)).toHaveLength(1)
		expect(getTokenArray(`+.1em`)).toHaveLength(1)
		expect(getTokenArray(`-.1em`)).toHaveLength(1)
	})

	test('Tokenizing unusual breaks', () => {
		expect(getTokenArray(`@\n`)).toHaveLength(2)
		expect(getTokenArray(`@\\\n`)).toHaveLength(3)
		expect(getTokenArray(`@A\n`)).toHaveLength(2)
		expect(getTokenArray(`@A\\\n`)).toHaveLength(3)
		expect(getTokenArray(`@-\n`)).toHaveLength(3)
		expect(getTokenArray(`@-\\\n`)).toHaveLength(4)

		expect(getTokenArray(`1` + `\n`)).toHaveLength(2)
		expect(getTokenArray(`1` + `\\` + `\n`)).toHaveLength(3)
		expect(getTokenArray(`1` + `-` + `\n`)).toHaveLength(3)
		expect(getTokenArray(`1` + `-` + `\\` + `\n`)).toHaveLength(4)

		expect(getTokenArray(`-` + `.`)).toHaveLength(2)
		expect(getTokenArray(`-` + `.` + `+8`)).toHaveLength(3)
		expect(getTokenArray(`+` + `.` + `-8`)).toHaveLength(3)
		expect(getTokenArray(`8e` + `+` + `-`)).toHaveLength(3)
		expect(getTokenArray(`8e-` + `+`)).toHaveLength(2)
	})
})

describe('Library accuracy', () => {
	test('Bootstrap', () => {
		let sourceCSS = fs.readFileSync('./node_modules/bootstrap/dist/css/bootstrap.css', 'utf-8')
		let resultCSS = ''
		tokenize(sourceCSS, token => {
			resultCSS += getTokenString(sourceCSS, token)
		})
		expect(sourceCSS).toBe(resultCSS)
	})

	test('Tailwind CSS', () => {
		let sourceCSS = fs.readFileSync('./node_modules/tailwindcss/dist/tailwind.css', 'utf-8')
		let resultCSS = ''
		tokenize(sourceCSS, token => {
			resultCSS += getTokenString(sourceCSS, token)
		})
		expect(sourceCSS).toBe(resultCSS)
	})
})
