import { CSSState, CSSToken } from '../types/global/global.js'

import * as cp from './code-points.js'
import * as is from './is.js'
import * as tt from './token-types.scss.js'

/** Consumes and returns a token. [↗](https://drafts.csswg.org/css-syntax/#consume-token) */
export const consume = (
	/** Condition of the current tokenizer. */
	state: CSSState
) => {
	switch (true) {
		/* <comment-token>
		/* https://drafts.csswg.org/css-syntax/#consume-comment */
		case state.codeAt0 === cp.SOLIDUS:
			if (state.codeAt1 === cp.ASTERISK) return consumeCommentToken(state, state.tick, consumeAnyValue(state) + consumeAnyValue(state), 0)
			break

		/* <space-token>
		/* https://drafts.csswg.org/css-syntax/#whitespace-token-diagram */
		case is.space[state.codeAt0]:
			return consumeSpaceToken(state, state.tick, consumeAnyValue(state))

		/* <string-token>
		/* https://drafts.csswg.org/css-syntax/#string-token-diagram */
		case state.codeAt0 === cp.QUOTATION_MARK:
		case state.codeAt0 === cp.APOSTROPHE:
			// "" || ''
			return consumeStringToken(state, state.codeAt0, state.tick, consumeAnyValue(state), 0)

		/* <hash-token>
		/* https://drafts.csswg.org/css-syntax/#hash-token-diagram */
		case state.codeAt0 === cp.NUMBER_SIGN:
			// #W
			if (is.identifier[state.codeAt1] || state.codeAt1 >= cp.NON_ASCII) return <CSSToken>{
				lead: state.tick,
				code: tt.HASH,
				data: consumeAnyValue(state) + consumeAnyValue(state) + consumeIdentifierValue(state),
				edge: 0,
			}
			// #\:
			if (is.validEscape(state.codeAt1, state.codeAt2)) return <CSSToken>{
				lead: state.tick,
				code: tt.HASH,
				data: consumeAnyValue(state) + consumeAnyValue(state) + consumeAnyValue(state) + consumeIdentifierValue(state),
				edge: 0,
			}
			break

		/* <variable-token>
		/* https://sass-lang.com/documentation/variables */
		case state.codeAt0 === cp.DOLLAR_SIGN:
			// $W
			if (is.identifier[state.codeAt1] || state.codeAt1 >= cp.NON_ASCII) return <CSSToken>{
				lead: state.tick,
				code: tt.VARIABLE,
				data: consumeAnyValue(state) + consumeAnyValue(state) + consumeIdentifierValue(state),
				edge: 0,
			}
			// $\:
			if (is.validEscape(state.codeAt1, state.codeAt2)) return <CSSToken>{
				lead: state.tick,
				code: tt.VARIABLE,
				data: consumeAnyValue(state) + consumeAnyValue(state) + consumeAnyValue(state) + consumeIdentifierValue(state),
				edge: 0,
			}
			break

		/* <ident-token> */
		/* https://drafts.csswg.org/css-syntax/#ident-token-diagram */
		case state.codeAt0 === cp.REVERSE_SOLIDUS:
			if (is.validEscape(state.codeAt0, state.codeAt1)) return consumeIdentifierLikeToken(state, {
				lead: state.tick,
				code: tt.WORD,
				data: consumeAnyValue(state) + consumeAnyValue(state) + consumeAnyValue(state) + consumeIdentifierValue(state),
				edge: 0,
			})
			break
		case is.identifierStart[state.codeAt0]:
		case state.codeAt0 >= cp.NON_ASCII:
			// W
			return consumeIdentifierLikeToken(state, {
				lead: state.tick,
				code: tt.WORD,
				data: consumeAnyValue(state) + consumeIdentifierValue(state),
				edge: 0,
			})
		case state.codeAt0 === cp.HYPHEN_MINUS:
			// -W
			if (state.codeAt1 === cp.HYPHEN_MINUS || is.identifierStart[state.codeAt1] || state.codeAt1 >= cp.NON_ASCII) return consumeIdentifierLikeToken(state, {
				lead: state.tick,
				code: tt.WORD,
				data: consumeAnyValue(state) + consumeAnyValue(state) + consumeIdentifierValue(state),
				edge: 0,
			})
			// -\:
			if (is.validEscape(state.codeAt1, state.codeAt2)) return consumeIdentifierLikeToken(state, {
				lead: state.tick,
				code: tt.WORD,
				data: consumeAnyValue(state) + consumeAnyValue(state) + consumeAnyValue(state) + consumeIdentifierValue(state),
				edge: 0,
			})

		/* <number-token> */
		/* https://drafts.csswg.org/css-syntax/#number-token-diagram */
			// -8
			if (is.digit[state.codeAt1]) return <CSSToken>{
				lead: state.tick,
				code: tt.NUMBER,
				data: consumeAnyValue(state) + consumeAnyValue(state) + consumeNumberSansAdditiveValue(state),
				edge: consumeNumericUnitValue(state),
			}
			// -.8
			if (state.codeAt1 === cp.FULL_STOP && is.digit[state.codeAt2]) return <CSSToken>{
				lead: state.tick,
				code: tt.NUMBER,
				data: consumeAnyValue(state) + consumeAnyValue(state) + consumeAnyValue(state) + consumeNumberSansDecimalValue(state),
				edge: consumeNumericUnitValue(state),
			}
		case state.codeAt0 === cp.FULL_STOP:
			// .8
			if (is.digit[state.codeAt1]) return <CSSToken>{
				lead: state.tick,
				code: tt.NUMBER,
				data: consumeAnyValue(state) + consumeAnyValue(state) + consumeNumberSansDecimalValue(state),
				edge: consumeNumericUnitValue(state),
			}
			break
		case state.codeAt0 === cp.PLUS_SIGN:
			// +8
			if (is.digit[state.codeAt1]) return <CSSToken>{
				lead: state.tick,
				code: tt.NUMBER,
				data: consumeAnyValue(state) + consumeAnyValue(state) + consumeNumberSansAdditiveValue(state),
				edge: consumeNumericUnitValue(state),
			}
			// +.8
			if (state.codeAt1 === cp.FULL_STOP && is.digit[state.codeAt2]) return <CSSToken>{
				lead: state.tick,
				code: tt.NUMBER,
				data: consumeAnyValue(state) + consumeAnyValue(state) + consumeAnyValue(state) + consumeNumberSansDecimalValue(state),
				edge: consumeNumericUnitValue(state),
			}
			break
		case is.digit[state.codeAt0]:
			// 8
			return <CSSToken>{
				lead: state.tick,
				code: tt.NUMBER,
				data: consumeAnyValue(state) + consumeNumberSansAdditiveValue(state),
				edge: consumeNumericUnitValue(state),
			}

		/* <atident-token> */
		/* https://drafts.csswg.org/css-syntax/#at-keyword-token-diagram */
		case state.codeAt0 === cp.COMMERCIAL_AT:
			if (state.codeAt1 === cp.HYPHEN_MINUS) {
				// @--
				if (state.codeAt2 === cp.HYPHEN_MINUS) return <CSSToken>{
					lead: state.tick,
					code: tt.ATWORD,
					data: consumeAnyValue(state) + consumeAnyValue(state) + consumeAnyValue(state) + consumeIdentifierValue(state),
					edge: 0,
				}
				// @-W
				if (is.identifierStart[state.codeAt2] || state.codeAt2 >= cp.NON_ASCII) return <CSSToken>{
					lead: state.tick,
					code: tt.ATWORD,
					data: consumeAnyValue(state) + consumeAnyValue(state) + consumeAnyValue(state) + consumeIdentifierValue(state),
					edge: 0,
				}
				// @-\:
				if (is.validEscape(state.codeAt2, state.codeAt3)) return <CSSToken>{
					lead: state.tick,
					code: tt.ATWORD,
					data: consumeAnyValue(state) + consumeAnyValue(state) + consumeAnyValue(state) + consumeAnyValue(state) + consumeIdentifierValue(state),
					edge: 0,
				}
			}
			// @W
			if (is.identifierStart[state.codeAt1] || state.codeAt1 >= cp.NON_ASCII) return <CSSToken>{
				lead: state.tick,
				code: tt.ATWORD,
				data: consumeAnyValue(state) + consumeAnyValue(state) + consumeIdentifierValue(state),
				edge: 0,
			}
			// @\:
			if (is.validEscape(state.codeAt1, state.codeAt2)) return <CSSToken>{
				lead: state.tick,
				code: tt.ATWORD,
				data: consumeAnyValue(state) + consumeAnyValue(state) + consumeAnyValue(state) + consumeIdentifierValue(state),
				edge: 0,
			}
			break
	}

	/* <delim-token> */
	/* https://drafts.csswg.org/css-syntax/#typedef-delim-token */
	return <CSSToken>{
		lead: state.tick,
		code: state.codeAt0,
		data: consumeAnyValue(state),
		edge: 0,
	}
}

/** Consume and return a value. [↗](https://drafts.csswg.org/css-syntax/#consume-token) */
const consumeAnyValue = (state: CSSState) => {
	++state.tick

	state.codeAt0 = state.codeAt1
	state.codeAt1 = state.codeAt2
	state.codeAt2 = state.codeAt3
	state.codeAt3 = state.tick + 3 < state.data.length ? state.data.charCodeAt(state.tick + 3) : -1

	return 1
}

/** Consume and return an identifier value. [↗](https://drafts.csswg.org/css-syntax/#consume-an-identifier) */
const consumeIdentifierValue = (state: CSSState) => {
	let result = 0

	while (state.tick < state.data.length) {
		switch (true) {
			case is.validEscape(state.codeAt0, state.codeAt1):
				result += consumeAnyValue(state)

			case is.identifier[state.codeAt0]:
			case state.codeAt0 >= cp.NON_ASCII:
				result += consumeAnyValue(state)
				continue
		}
		break
	}

	return result
}

/** Consume and return an identifier or function token. [↗](https://drafts.csswg.org/css-syntax/#consume-an-identifier) */
const consumeIdentifierLikeToken = (state: CSSState, token: CSSToken) => {
	if (state.codeAt0 === cp.LEFT_PARENTHESIS) {
		token.code = 40
		token.type = tt.FUNCTION
		token.edge = consumeAnyValue(state)
	}

	return token
}

/** Consume and return a comment token. [↗](https://drafts.csswg.org/css-syntax/#consume-comment) */
const consumeCommentToken = (state: CSSState, lead: number, data: number, edge: number) => {
	while (state.tick < state.data.length) {
		if (state.codeAt0 === cp.ASTERISK && state.codeAt1 === cp.SOLIDUS) {
			edge = consumeAnyValue(state) + consumeAnyValue(state)
			break
		}

		data += consumeAnyValue(state)
	}

	return <CSSToken>{
		lead: lead,
		code: tt.COMMENT,
		data: data,
		edge: edge,
	}
}

/** Consumes and returns a space token. [↗](https://drafts.csswg.org/css-syntax/#whitespace-token-diagram) */
const consumeSpaceToken = (state: CSSState, lead: number, data: number) => {
	while (state.tick < state.data.length) {
		if (!is.space[state.codeAt0]) break
		data += consumeAnyValue(state)
	}

	return <CSSToken>{
		lead: lead,
		code: tt.SPACE,
		data: data,
		edge: 0,
	}
}

/** Consumes and returns a string token. [↗](https://drafts.csswg.org/css-syntax/#string-token-diagram) */
const consumeStringToken = (state: CSSState, code: number, lead: number, data: number, edge: number) => {
	while (state.tick < state.data.length) {
		switch (true) {
			case is.validEscape(state.codeAt0, state.codeAt1):
				data += consumeAnyValue(state)
			default:
				data += consumeAnyValue(state)
				continue
			case state.codeAt0 === code:
				edge = consumeAnyValue(state)
		}
		break
	}

	return <CSSToken>{
		lead: lead,
		code: tt.STRING,
		data: data,
		edge: edge,
	}
}

/** Consumes and returns a number value after an additive symbol. [↗](https://drafts.csswg.org/css-syntax/#consume-a-number) */
export const consumeNumberSansAdditiveValue = (state: CSSState) => {
	let result = consumeDigitValue(state)

	if (state.codeAt0 === cp.FULL_STOP && is.digit[state.codeAt1]) result += consumeAnyValue(state) + consumeAnyValue(state) + consumeDigitValue(state)

	return result + consumeNumberSansDecimalValue(state)
}

/** Consumes and returns a number value after a decimal place. [↗](https://drafts.csswg.org/css-syntax/#consume-a-number) */
const consumeNumberSansDecimalValue = (state: CSSState) => {
	let result = consumeDigitValue(state)

	if (state.codeAt0 === cp.LATIN_CAPITAL_LETTER_E || state.codeAt0 === cp.LATIN_SMALL_LETTER_E) {
		switch (true) {
			case state.codeAt1 === cp.PLUS_SIGN:
			case state.codeAt1 === cp.HYPHEN_MINUS:
				if (!is.digit[state.codeAt2]) break

				result += consumeAnyValue(state)

			case is.digit[state.codeAt1]:
				result += consumeAnyValue(state) + consumeAnyValue(state) + consumeDigitValue(state)
		}
	}

	return result
}

/** Consumes and returns a digit value. [↗](https://drafts.csswg.org/css-syntax/#consume-a-number) */
const consumeDigitValue = (state: CSSState) => {
	let result = 0

	while (state.tick < state.data.length) {
		if (!is.digit[state.codeAt0]) break

		result += consumeAnyValue(state)
	}

	return result
}

/** Consumes and returns a numeric unit value. [↗](https://drafts.csswg.org/css-syntax/#consume-an-identifier) */
const consumeNumericUnitValue = (state: CSSState) => (
	state.codeAt0 === cp.HYPHEN_MINUS
		? state.codeAt1 === cp.HYPHEN_MINUS
			? consumeAnyValue(state) + consumeAnyValue(state) + consumeIdentifierValue(state)
		: is.identifierStart[state.codeAt1] || state.codeAt1 >= cp.NON_ASCII
			? consumeAnyValue(state) + consumeAnyValue(state) + consumeIdentifierValue(state)
		: is.validEscape(state.codeAt1, state.codeAt2)
			? consumeAnyValue(state) + consumeAnyValue(state) + consumeAnyValue(state) + consumeIdentifierValue(state)
		: 0
	: state.codeAt0 === cp.PERCENT_SIGN
		? consumeAnyValue(state)
	: is.identifierStart[state.codeAt0] || state.codeAt0 >= cp.NON_ASCII
		? consumeAnyValue(state) + consumeIdentifierValue(state)
	: is.validEscape(state.codeAt0, state.codeAt1)
		? consumeAnyValue(state) + consumeAnyValue(state) + consumeIdentifierValue(state)
	: 0
)
