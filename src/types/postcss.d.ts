import { Input } from 'postcss'

declare module 'postcss/lib/tokenize.ts' {
	export default function tokenizer (input: Input, options?: { ignoreErrors?: boolean }): Tokenizer

	export type Tokenizer = {
		back(): void
		nextToken(): Token
		endOfFile(): boolean
		position(): number
	}

	export type Token = [string, string, number, number]
}
