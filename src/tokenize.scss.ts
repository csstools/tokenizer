import { CSSState, CSSIterator, CSSIteration } from './types/global/global.js'
import { consume } from './lib/consume.scss.js'

/** Returns a CSS iterator to yield tokens from the given CSS data. */
export const tokenize = (/** CSS data. */ data: string) => {
	let size = data.length
	let tick = 0

	/** Condition of the current tokenizer. */
	let state: CSSState = {
		data,
		size,
		tick,
		codeAt0: tick + 0 < size ? data.charCodeAt(tick + 0) : -1,
		codeAt1: tick + 1 < size ? data.charCodeAt(tick + 1) : -1,
		codeAt2: tick + 2 < size ? data.charCodeAt(tick + 2) : -1,
		codeAt3: tick + 3 < size ? data.charCodeAt(tick + 3) : -1,
		/** Advances the unicode characters being read from the CSS data by one position. */
		next() {
			state.tick = ++tick
			state.codeAt0 = state.codeAt1
			state.codeAt1 = state.codeAt2
			state.codeAt2 = state.codeAt3
			state.codeAt3 = tick + 3 < size ? data.charCodeAt(tick + 3) : -1
			return tick >= size
		}
	}

	/** Returns the most recent state and token yielded from the CSS iterator. */
	const iterator: CSSIterator = ((): CSSIteration => (
		state.tick >= state.size
			? {
				done: true,
				value: { tick: state.tick, type: 0, code: -2, lead: '', data: '', tail: '' }
			}
		: {
			done: false,
			value: consume(state),
		}
	)) as CSSIterator

	iterator[Symbol.iterator] = () => ({ next: iterator })

	return iterator
}
