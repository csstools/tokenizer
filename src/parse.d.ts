import type { CSSToken } from '../.wip/parse.types.js'

export interface State {
	/** String of CSS consumed as tokens. */
	text: string

	/** Current position being tokenized in the CSS. */
	tick: number

	/** Unicode character for the current position in the CSS. */
	charAt0: string

	/** Unicode character for the 1 ahead position in the CSS. */
	charAt1: string

	/** Unicode character for the 2 ahead position in the CSS. */
	charAt2: string

	/** Unicode character for the 3 ahead position in the CSS. */
	charAt3: string
}

export interface Token {
	/** Number identifying the kind of token. */
	token: CSSToken

	/** Position in the CSS where the token starts. */
	enter: number

	/** Position in the CSS where the token may split into two parts. */
	split: number

	/** Position in the CSS where the token ends. */
	leave: number
}

export interface Parser {
	(): Token | undefined
}

/** Reads the given CSS text and invokes the given callback with each consumed CSS token. */
export declare const parse: (text: string) => Parser
