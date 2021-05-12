import * as cp from './code-points.js'

/** Returns whether the unicode value is a digit. [↗](https://drafts.csswg.org/css-syntax/#digit) */
export const digit = (code: number) => code >= cp.DIGIT_ZERO && code <= cp.DIGIT_NINE

/** Returns whether the unicode value is an identifier. [↗](https://drafts.csswg.org/css-syntax/#identifier-code-point) */
export const identifier = (code: number) => (
	identifierStart(code) ||
	(code >= cp.DIGIT_ZERO && code <= cp.DIGIT_NINE) ||
	(code === cp.HYPHEN_MINUS)
)

/** Returns whether the unicode value is an identifier-start. [↗](https://drafts.csswg.org/css-syntax/#identifier-start-code-point) */
export const identifierStart = (code: number) => (
	(code === cp.LOW_LINE) ||
	(code >= cp.NON_ASCII) ||
	(code >= cp.LATIN_CAPITAL_LETTER_A && code <= cp.LATIN_CAPITAL_LETTER_Z) ||
	(code >= cp.LATIN_SMALL_LETTER_A && code <= cp.LATIN_SMALL_LETTER_Z)
)

/** Returns whether the unicode value is a space. [↗](https://drafts.csswg.org/css-syntax/#whitespace) */
export const space = (code: number) => (
	code === cp.CHARACTER_TABULATION
	|| code === cp.LINE_FEED
	|| code === cp.FORM_FEED
	|| code === cp.CARRIAGE_RETURN
	|| code === cp.SPACE
)

/** Returns whether the unicode values are a valid escape. [↗](https://drafts.csswg.org/css-syntax/#starts-with-a-valid-escape) */
export const validEscape = (code1of2: number, code2of2: number) => (
	code1of2 === cp.REVERSE_SOLIDUS
	&& !space(code2of2)
)
