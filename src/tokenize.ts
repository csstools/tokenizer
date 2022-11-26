import { consume } from './lib/consume.js'

/** Reads the given CSS text and invokes the given callback with each consumed CSS token. */
export const tokenize = (
	text: string
): Tokenizer => {
	let state: State = {
		text,
		tick: 0,
		codeAt0: text.charCodeAt(0) || -1,
		codeAt1: text.charCodeAt(1) || -1,
		codeAt2: text.charCodeAt(2) || -1,
		codeAt3: text.charCodeAt(3) || -1,
	}

	return () => state.tick < text.length ? consume(state) : undefined
}

export interface Tokenizer {
	(): Token | undefined
}

export interface State {
	/** String of CSS consumed as tokens. */
	text: string

	/** Current position being tokenized in the CSS. */
	tick: number

	/** Unicode character for the current position in the CSS. */
	codeAt0: number

	/** Unicode character for the 1 ahead position in the CSS. */
	codeAt1: number

	/** Unicode character for the 2 ahead position in the CSS. */
	codeAt2: number

	/** Unicode character for the 3 ahead position in the CSS. */
	codeAt3: number
}

export interface Token {
	/** Number identifying the kind of token. */
	token: number

	/** Position in the CSS where the token starts. */
	enter: number

	/** Position in the CSS where the token may split into two parts. */
	split: number

	/** Position in the CSS where the token ends. */
	leave: number
}
