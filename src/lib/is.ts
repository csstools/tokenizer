import * as cp from './code-points.js'

/** Returns whether the unicode value is a space. [↗](https://drafts.csswg.org/css-syntax/#whitespace) */
export const ascii = {} as { [code: number]: boolean }

/** Returns whether the unicode value is a digit. [↗](https://drafts.csswg.org/css-syntax/#digit) */
export const digit = {} as { [code: number]: boolean }

/** Returns whether the unicode value is an identifier. [↗](https://drafts.csswg.org/css-syntax/#identifier-code-point) */
export const identifier = {} as { [code: number]: boolean }

/** Returns whether the unicode value is an identifier-start. [↗](https://drafts.csswg.org/css-syntax/#identifier-start-code-point) */
export const identifierStart = {} as { [code: number]: boolean }

/** Returns whether the unicode value is a space. [↗](https://drafts.csswg.org/css-syntax/#whitespace) */
export const space = {} as { [code: number]: boolean }

/** Returns whether the unicode values are a valid escape. [↗](https://drafts.csswg.org/css-syntax/#starts-with-a-valid-escape) */
export const validEscape = (code1of2: number, code2of2: number) => (
	code1of2 === cp.REVERSE_SOLIDUS
	&& !space[code2of2]
)

for (let code = 0; code <= cp.NON_ASCII; ++code) {
	ascii[code] = true

	switch (true) {
		case code >= cp.DIGIT_ZERO && code <= cp.DIGIT_NINE:
			identifier[code] = true
			digit[code] = true
			break
		case code === cp.CHARACTER_TABULATION:
		case code === cp.LINE_FEED:
		case code === cp.FORM_FEED:
		case code === cp.CARRIAGE_RETURN:
		case code === cp.SPACE:
			space[code] = true
			break
		case code === cp.LOW_LINE:
		case code >= cp.LATIN_CAPITAL_LETTER_A && code <= cp.LATIN_CAPITAL_LETTER_Z:
		case code >= cp.LATIN_SMALL_LETTER_A && code <= cp.LATIN_SMALL_LETTER_Z:
			identifierStart[code] = true
		case code === cp.HYPHEN_MINUS:
			identifier[code] = true
	}
}
