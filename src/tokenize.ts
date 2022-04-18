import { CSSState, CSSIteration } from './types/global/global.js'
import { consume } from './lib/consume.js'

/** Returns a CSS iterator to yield tokens from the given CSS data. */
export const tokenize = (/** CSS data. */ data: string, /** CSS callback. */ call: CSSIteration) => {
	/** Condition of the current tokenizer. */
	let state: CSSState = {
		data,
		tick: 0,
		codeAt0: data.charCodeAt(0) || -1,
		codeAt1: data.charCodeAt(1) || -1,
		codeAt2: data.charCodeAt(2) || -1,
		codeAt3: data.charCodeAt(3) || -1,
	}

	while (state.tick < data.length) call(consume(state))
}
