import type { State, Token, Tokenizer } from './tokenize.d'
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

export { State, Token, Tokenizer }
