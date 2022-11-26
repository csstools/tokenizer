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

export interface Tokenizer {
	(): Token | undefined
}

/** Reads the given CSS text and invokes the given callback with each consumed CSS token. */
export declare const tokenize: (text: string) => Tokenizer
