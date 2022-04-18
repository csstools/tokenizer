/** The CSS state represents the condition of the tokenizer at any given moment. */
export type CSSState = {
	/** CSS data. */
	data: string
	/** Current position in the CSS data. */
	tick: number
	/** Unicode character for the current position in the CSS data. */
	codeAt0: number
	/** Unicode character for the 1 ahead position in the CSS data. */
	codeAt1: number
	/** Unicode character for the 2 ahead position in the CSS data. */
	codeAt2: number
	/** Unicode character for the 3 ahead position in the CSS data. */
	codeAt3: number
}

/** The CSS iterator produces a sequence of CSS tokens in an iterator pattern. */
export type CSSIterator = {
	(): CSSIteration
	[Symbol.iterator](): {
		next: CSSIterator
	}
}

/** The CSS iteration represents the most recent state and token yielded from the CSS iterator. */
export type CSSIteration = (token: CSSToken) => any

export type CSSToken = {
	lead: number
	code: number
	data: number
	edge: number
}

export type CSSTokenize = (data: string, callback: CSSIteration) => void

export declare const tokenize: CSSTokenize
