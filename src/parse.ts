import type { Parser, State, Token } from './parse.d'
import { consume } from './lib/parse.consume.js'

/** Reads the given CSS text and invokes the given callback with each consumed CSS token. */
export const parse = (
	text: string
): Parser => {
	let state: State = {
		text,
		tick: 0,
		charAt0: text.charAt(0),
		charAt1: text.charAt(1),
		charAt2: text.charAt(2),
		charAt3: text.charAt(3),
	}

	return () => state.tick < text.length ? consume(state) : undefined
}

export { Parser, State, Token }
