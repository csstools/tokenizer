import { CSSState, CSSToken } from '../types/global/global.js'

import * as cp from './code-points.js'
import * as is from './is.js'
import * as tt from './token-types.js'

const { fromCharCode } = String

/** Consumes and returns a token. [↗](https://drafts.csswg.org/css-syntax/#consume-token) */
export const consume = (
	/** Condition of the current tokenizer. */
	state: CSSState
) => {
	switch (true) {
		/* <comment-token>
		/* https://drafts.csswg.org/css-syntax/#consume-comment */
		case state.codeAt0 === cp.SOLIDUS:
			if (state.codeAt1 === cp.ASTERISK) return consumeCommentToken(state)
			break
		/* <space-token>
		/* https://drafts.csswg.org/css-syntax/#whitespace-token-diagram */
		case is.space(state.codeAt0):
			return consumeSpaceToken(state)
		/* <string-token>
		/* https://drafts.csswg.org/css-syntax/#string-token-diagram */
		case state.codeAt0 === cp.QUOTATION_MARK:
		case state.codeAt0 === cp.APOSTROPHE:
			// "" || ''
			return consumeStringToken(state)
		/* <hash-token>
		/* https://drafts.csswg.org/css-syntax/#hash-token-diagram */
		case state.codeAt0 === cp.NUMBER_SIGN:
			// #W
			if (is.identifier(state.codeAt1)) return {
				tick: state.tick,
				type: tt.HASH,
				code: -1,
				lead: consumeAnyValue(state),
				data: consumeAnyValue(state) + consumeIdentifierValue(state),
				tail: '',
			} as CSSToken
			// #\:
			if (is.validEscape(state.codeAt1, state.codeAt2)) return {
				tick: state.tick,
				type: tt.HASH,
				code: -1,
				lead: consumeAnyValue(state),
				data: consumeAnyValue(state) + consumeAnyValue(state) + consumeIdentifierValue(state),
				tail: '',
			} as CSSToken
			break
		/* <ident-token> */
		/* https://drafts.csswg.org/css-syntax/#ident-token-diagram */
		case state.codeAt0 === cp.REVERSE_SOLIDUS:
			if (is.validEscape(state.codeAt0, state.codeAt1)) return consumeIdentifierLikeToken(state, {
				tick: state.tick,
				type: tt.WORD,
				code: -1,
				lead: '',
				data: consumeAnyValue(state) + consumeAnyValue(state) + consumeAnyValue(state) + consumeIdentifierValue(state),
				tail: '',
			})
			break
		case is.identifierStart(state.codeAt0):
			// W
			return consumeIdentifierLikeToken(state, {
				tick: state.tick,
				type: tt.WORD,
				code: -1,
				lead: '',
				data: consumeAnyValue(state) + consumeIdentifierValue(state),
				tail: '',
			})
		case state.codeAt0 === cp.HYPHEN_MINUS:
			// -W
			if (state.codeAt1 === cp.HYPHEN_MINUS || is.identifierStart(state.codeAt1)) return consumeIdentifierLikeToken(state, {
				tick: state.tick,
				type: tt.WORD,
				code: -1,
				lead: '',
				data: consumeAnyValue(state) + consumeAnyValue(state) + consumeIdentifierValue(state),
				tail: '',
			})
			// -\:
			if (is.validEscape(state.codeAt1, state.codeAt2)) return consumeIdentifierLikeToken(state, {
				tick: state.tick,
				type: tt.WORD,
				code: -1,
				lead: '',
				data: consumeAnyValue(state) + consumeAnyValue(state) + consumeAnyValue(state) + consumeIdentifierValue(state),
				tail: '',
			})
		/* <number-token> */
		/* https://drafts.csswg.org/css-syntax/#number-token-diagram */
			// -8
			if (is.digit(state.codeAt1)) return {
				tick: state.tick,
				type: tt.NUMBER,
				code: -1,
				lead: '',
				data: consumeAnyValue(state) + consumeAnyValue(state) + consumeNumberSansAdditiveValue(state),
				tail: consumeNumericUnitValue(state),
			} as CSSToken
			// -.8
			if (state.codeAt1 === cp.FULL_STOP && is.digit(state.codeAt2)) return {
				tick: state.tick,
				type: tt.NUMBER,
				code: -1,
				lead: '',
				data: consumeAnyValue(state) + consumeAnyValue(state) + consumeAnyValue(state) + consumeNumberSansDecimalValue(state),
				tail: consumeNumericUnitValue(state),
			} as CSSToken
		case state.codeAt0 === cp.FULL_STOP:
			// .8
			if (is.digit(state.codeAt1)) return {
				tick: state.tick,
				type: tt.NUMBER,
				code: -1,
				lead: '',
				data: consumeAnyValue(state) + consumeAnyValue(state) + consumeNumberSansDecimalValue(state),
				tail: consumeNumericUnitValue(state),
			} as CSSToken
			break
		case state.codeAt0 === cp.PLUS_SIGN:
			// +8
			if (is.digit(state.codeAt1)) return {
				tick: state.tick,
				type: tt.NUMBER,
				code: -1,
				lead: '',
				data: consumeAnyValue(state) + consumeAnyValue(state) + consumeNumberSansAdditiveValue(state),
				tail: consumeNumericUnitValue(state),
			} as CSSToken
			// +.8
			if (state.codeAt1 === cp.FULL_STOP && is.digit(state.codeAt2)) return {
				tick: state.tick,
				type: tt.NUMBER,
				code: -1,
				lead: '',
				data: consumeAnyValue(state) + consumeAnyValue(state) + consumeAnyValue(state) + consumeNumberSansDecimalValue(state),
				tail: consumeNumericUnitValue(state),
			} as CSSToken
			break
		case is.digit(state.codeAt0):
			// 8
			return {
				tick: state.tick,
				type: tt.NUMBER,
				code: -1,
				lead: '',
				data: consumeAnyValue(state) + consumeNumberSansAdditiveValue(state),
				tail: consumeNumericUnitValue(state),
			} as CSSToken
		/* <atident-token> */
		/* https://drafts.csswg.org/css-syntax/#at-keyword-token-diagram */
		case state.codeAt0 === cp.COMMERCIAL_AT:
			if (state.codeAt1 === cp.HYPHEN_MINUS) {
				// @--
				if (state.codeAt2 === cp.HYPHEN_MINUS) return {
					tick: state.tick,
					type: tt.ATWORD,
					code: -1,
					lead: consumeAnyValue(state),
					data: consumeAnyValue(state) + consumeAnyValue(state) + consumeIdentifierValue(state),
					tail: '',
				} as CSSToken
				// @-W
				if (is.identifierStart(state.codeAt2)) return {
					tick: state.tick,
					type: tt.ATWORD,
					code: -1,
					lead: consumeAnyValue(state),
					data: consumeAnyValue(state) + consumeAnyValue(state) + consumeIdentifierValue(state),
					tail: '',
				} as CSSToken
				// @-\:
				if (is.validEscape(state.codeAt2, state.codeAt3)) return {
					tick: state.tick,
					type: tt.ATWORD,
					code: -1,
					lead: consumeAnyValue(state),
					data: consumeAnyValue(state) + consumeAnyValue(state) + consumeAnyValue(state) + consumeIdentifierValue(state),
					tail: '',
				} as CSSToken
			}
			// @W
			if (is.identifierStart(state.codeAt1)) return {
				tick: state.tick,
				type: tt.ATWORD,
				code: -1,
				lead: consumeAnyValue(state),
				data: consumeAnyValue(state) + consumeIdentifierValue(state),
				tail: '',
			} as CSSToken
			// @\:
			if (is.validEscape(state.codeAt1, state.codeAt2)) return {
				tick: state.tick,
				type: tt.ATWORD,
				code: -1,
				lead: consumeAnyValue(state),
				data: consumeAnyValue(state) + consumeAnyValue(state) + consumeIdentifierValue(state),
				tail: '',
			} as CSSToken
			break
	}
	/* <delim-token> */
	/* https://drafts.csswg.org/css-syntax/#typedef-delim-token */
	return {
		tick: state.tick,
		type: tt.SYMBOL,
		code: state.codeAt0,
		lead: '',
		data: consumeAnyValue(state),
		tail: '',
	} as CSSToken
}

/** Consume and return a value. [↗](https://drafts.csswg.org/css-syntax/#consume-token) */
const consumeAnyValue = (state: CSSState) => {
	const result = fromCharCode(state.codeAt0)
	state.next()
	return result
}

/** Consume and return an identifier value. [↗](https://drafts.csswg.org/css-syntax/#consume-an-identifier) */
const consumeIdentifierValue = (state: CSSState) => {
	let result = ''
	while (true) {
		switch (true) {
			case is.validEscape(state.codeAt0, state.codeAt1):
				result += fromCharCode(state.codeAt0)
				state.next()
			case is.identifier(state.codeAt0):
				result += fromCharCode(state.codeAt0)
				state.next()
				continue
		}
		break
	}
	return result
}

/** Consume and return an identifier or function token. [↗](https://drafts.csswg.org/css-syntax/#consume-an-identifier) */
const consumeIdentifierLikeToken = (state: CSSState, token: CSSToken) => {
	if (state.codeAt0 === cp.LEFT_PARENTHESIS) {
		token.type = tt.ACTION
		token.tail = '('
		state.next()
	}
	return token
}

/** Consume and return a comment token. [↗](https://drafts.csswg.org/css-syntax/#consume-comment) */
const consumeCommentToken = (state: CSSState) => {
	const token: CSSToken = {
		tick: state.tick,
		type: tt.COMMENT,
		code: -1,
		lead: '/*',
		data: '',
		tail: '',
	}
	state.next()
	state.next()
	while (state.tick < state.size) {
		// @ts-ignore
		if (state.codeAt0 === cp.ASTERISK && state.codeAt1 === cp.SOLIDUS) {
			token.tail = '*/'
			state.next()
			state.next()
			break
		}
		token.data += consumeAnyValue(state)
	}
	return token
}

/** Consumes and returns a space token. [↗](https://drafts.csswg.org/css-syntax/#whitespace-token-diagram) */
const consumeSpaceToken = (state: CSSState) => {
	const token: CSSToken = {
		tick: state.tick,
		type: tt.SPACE,
		code: -1,
		lead: '',
		data: consumeAnyValue(state),
		tail: '',
	}
	while (state.tick < state.size) {
		if (!is.space(state.codeAt0)) break
		token.data += consumeAnyValue(state)
	}
	return token
}

/** Consumes and returns a string token. [↗](https://drafts.csswg.org/css-syntax/#string-token-diagram) */
const consumeStringToken = (state: CSSState) => {
	const { codeAt0 } = state
	const token: CSSToken = {
		tick: state.tick,
		type: tt.STRING,
		code: -1,
		lead: '',
		data: consumeAnyValue(state),
		tail: '',
	}
	while (state.tick < state.size) {
		switch (true) {
			case is.validEscape(state.codeAt0, state.codeAt1):
				token.data += consumeAnyValue(state)
			default:
				token.data += consumeAnyValue(state)
				continue
			case state.codeAt0 === codeAt0:
				token.tail = consumeAnyValue(state)
		}
		break
	}
	return token
}

/** Consumes and returns a number value after an additive symbol. [↗](https://drafts.csswg.org/css-syntax/#consume-a-number) */
export const consumeNumberSansAdditiveValue = (state: CSSState) => {
	let result = ''
	result += consumeDigitValue(state)
	if (state.codeAt0 === cp.FULL_STOP && is.digit(state.codeAt1)) result += consumeAnyValue(state) + consumeAnyValue(state) + consumeDigitValue(state)
	return result + consumeNumberSansDecimalValue(state)
}

/** Consumes and returns a number value after a decimal place. [↗](https://drafts.csswg.org/css-syntax/#consume-a-number) */
const consumeNumberSansDecimalValue = (state: CSSState) => {
	let result = ''
	result += consumeDigitValue(state)
	if (state.codeAt0 === cp.LATIN_CAPITAL_LETTER_E || state.codeAt0 === cp.LATIN_SMALL_LETTER_E) {
		switch (true) {
			case (state.codeAt1 === cp.PLUS_SIGN || state.codeAt1 === cp.HYPHEN_MINUS):
				if (!is.digit(state.codeAt2)) break
				result += consumeAnyValue(state)
			case is.digit(state.codeAt1):
				result += consumeAnyValue(state) + consumeAnyValue(state) + consumeDigitValue(state)
		}
	}
	return result
}

/** Consumes and returns a digit value. [↗](https://drafts.csswg.org/css-syntax/#consume-a-number) */
const consumeDigitValue = (state: CSSState) => {
	let result = ''
	while (state.tick < state.size) {
		if (!is.digit(state.codeAt0)) break
		result += consumeAnyValue(state)
	}
	return result
}

/** Consumes and returns a numeric unit value. [↗](https://drafts.csswg.org/css-syntax/#consume-an-identifier) */
const consumeNumericUnitValue = (state: CSSState) => (
	state.codeAt0 === cp.HYPHEN_MINUS
		? state.codeAt1 === cp.HYPHEN_MINUS
			? consumeAnyValue(state) + consumeAnyValue(state) + consumeIdentifierValue(state)
		: is.identifierStart(state.codeAt1)
			? consumeAnyValue(state) + consumeAnyValue(state) + consumeIdentifierValue(state)
		: is.validEscape(state.codeAt1, state.codeAt2)
			? consumeAnyValue(state) + consumeAnyValue(state) + consumeAnyValue(state) + consumeIdentifierValue(state)
		: ''
	: is.identifierStart(state.codeAt0)
		? consumeAnyValue(state) + consumeIdentifierValue(state)
	: is.validEscape(state.codeAt0, state.codeAt1)
		? consumeAnyValue(state) + consumeAnyValue(state) + consumeIdentifierValue(state)
	: ''
)
