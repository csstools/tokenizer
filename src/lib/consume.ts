import { State, Token } from '../tokenize.d'

import * as cp from './code-points.js'
import * as is from './is.js'
import * as tt from './token-types.js'

/** Consumes and returns a token. [↗](https://drafts.csswg.org/css-syntax/#consume-token) */
export const consume = (state: State) => {
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
			if (is.identifier[state.codeAt1] || !is.ascii[state.codeAt1]) return consumeAnyToken(
				tt.HASH,
				state.tick,
				consumeAnyValue(state) + consumeAnyValue(state) + consumeIdentifierValue(state),
				0,
				// state.dump,
			)
			// #\!
			if (is.validEscape(state.codeAt1, state.codeAt2)) return consumeAnyToken(
				tt.HASH,
				state.tick,
				consumeAnyValue(state) + consumeAnyValue(state) + consumeAnyValue(state) + consumeIdentifierValue(state),
				0,
				// state.dump,
			)
			break

		/* <ident-token> */
		/* https://drafts.csswg.org/css-syntax/#ident-token-diagram */
		case state.codeAt0 === cp.REVERSE_SOLIDUS:
			if (is.validEscape(state.codeAt0, state.codeAt1)) return consumeIdentifierLikeToken(state, state.tick, consumeAnyValue(state) + consumeAnyValue(state) + consumeAnyValue(state) + consumeIdentifierValue(state))
			break
		case is.identifierStart[state.codeAt0]:
		case !is.ascii[state.codeAt0]:
			// W
			return consumeIdentifierLikeToken(state, state.tick, consumeAnyValue(state) + consumeIdentifierValue(state))
		case state.codeAt0 === cp.HYPHEN_MINUS:
			// -W
			if (state.codeAt1 === cp.HYPHEN_MINUS || is.identifierStart[state.codeAt1] || !is.ascii[state.codeAt1]) return consumeIdentifierLikeToken(state, state.tick, consumeAnyValue(state) + consumeAnyValue(state) + consumeIdentifierValue(state))
			// -\!
			if (is.validEscape(state.codeAt1, state.codeAt2)) return consumeIdentifierLikeToken(state, state.tick, consumeAnyValue(state) + consumeAnyValue(state) + consumeAnyValue(state) + consumeIdentifierValue(state))

		/* <number-token> */
		/* https://drafts.csswg.org/css-syntax/#number-token-diagram */
			// -8
			if (is.digit[state.codeAt1]) return consumeAnyToken(
				tt.NUMBER,
				state.tick,
				consumeAnyValue(state) + consumeAnyValue(state) + consumeNumberSansAdditiveValue(state),
				consumeNumericUnitValue(state),
				// state.dump,
			)
			// -.8
			if (state.codeAt1 === cp.FULL_STOP && is.digit[state.codeAt2]) return consumeAnyToken(
				tt.NUMBER,
				state.tick,
				consumeAnyValue(state) + consumeAnyValue(state) + consumeAnyValue(state) + consumeNumberSansDecimalValue(state),
				consumeNumericUnitValue(state),
				// state.dump,
			)
		case state.codeAt0 === cp.FULL_STOP:
			// .8
			if (is.digit[state.codeAt1]) return consumeAnyToken(
				tt.NUMBER,
				state.tick,
				consumeAnyValue(state) + consumeAnyValue(state) + consumeNumberSansDecimalValue(state),
				consumeNumericUnitValue(state),
				// state.dump,
			)
			break
		case state.codeAt0 === cp.PLUS_SIGN:
			// +8
			if (is.digit[state.codeAt1]) return consumeAnyToken(
				tt.NUMBER,
				state.tick,
				consumeAnyValue(state) + consumeAnyValue(state) + consumeNumberSansAdditiveValue(state),
				consumeNumericUnitValue(state),
				// state.dump,
			)
			// +.8
			if (state.codeAt1 === cp.FULL_STOP && is.digit[state.codeAt2]) return consumeAnyToken(
				tt.NUMBER,
				state.tick,
				consumeAnyValue(state) + consumeAnyValue(state) + consumeAnyValue(state) + consumeNumberSansDecimalValue(state),
				consumeNumericUnitValue(state),
				// state.dump,
			)
			break
		case is.digit[state.codeAt0]:
			// 8
			return consumeAnyToken(
				tt.NUMBER,
				state.tick,
				consumeAnyValue(state) + consumeNumberSansAdditiveValue(state),
				consumeNumericUnitValue(state),
				// state.dump,
			)

		/* <atident-token> */
		/* https://drafts.csswg.org/css-syntax/#at-keyword-token-diagram */
		case state.codeAt0 === cp.COMMERCIAL_AT:
			if (state.codeAt1 === cp.HYPHEN_MINUS) {
				// @--
				if (state.codeAt2 === cp.HYPHEN_MINUS) return consumeAnyToken(
					tt.ATWORD,
					state.tick,
					consumeAnyValue(state) + consumeAnyValue(state) + consumeAnyValue(state) + consumeIdentifierValue(state),
					0,
					// state.dump,
				)
				// @-W
				if (is.identifierStart[state.codeAt2] || !is.ascii[state.codeAt2]) return consumeAnyToken(
					tt.ATWORD,
					state.tick,
					consumeAnyValue(state) + consumeAnyValue(state) + consumeAnyValue(state) + consumeIdentifierValue(state),
					0,
					// state.dump,
				)
				// @-\!
				if (is.validEscape(state.codeAt2, state.codeAt3)) return consumeAnyToken(
					tt.ATWORD,
					state.tick,
					consumeAnyValue(state) + consumeAnyValue(state) + consumeAnyValue(state) + consumeAnyValue(state) + consumeIdentifierValue(state),
					0,
					// state.dump,
				)
			}
			// @W
			if (is.identifierStart[state.codeAt1] || !is.ascii[state.codeAt1]) return consumeAnyToken(
				tt.ATWORD,
				state.tick,
				consumeAnyValue(state) + consumeAnyValue(state) + consumeIdentifierValue(state),
				0,
				// state.dump,
			)
			// @\!
			if (is.validEscape(state.codeAt1, state.codeAt2)) return consumeAnyToken(
				tt.ATWORD,
				state.tick,
				consumeAnyValue(state) + consumeAnyValue(state) + consumeAnyValue(state) + consumeIdentifierValue(state),
				0,
				// state.dump,
			)
			break
	}

	/* <delim-token> */
	/* https://drafts.csswg.org/css-syntax/#typedef-delim-token */
	return consumeAnyToken(
		tt.SYMBOL,
		state.tick,
		consumeAnyValue(state),
		0,
		// state.dump,
	)
}

/** Consume and return a value. [↗](https://drafts.csswg.org/css-syntax/#consume-token) */
const consumeAnyValue = (state: State) => {
	state.codeAt0 = state.codeAt1
	state.codeAt1 = state.codeAt2
	state.codeAt2 = state.codeAt3
	state.codeAt3 = ++state.tick + 3 < state.text.length ? state.text.charCodeAt(state.tick + 3) : -1

	return 1
}

/** Consume and return an identifier value. [↗](https://drafts.csswg.org/css-syntax/#consume-an-identifier) */
const consumeIdentifierValue = (state: State) => {
	let result = 0

	while (state.tick < state.text.length) {
		switch (true) {
			case is.validEscape(state.codeAt0, state.codeAt1):
				result += consumeAnyValue(state)

			case is.identifier[state.codeAt0]:
			case !is.ascii[state.codeAt0]:
				result += consumeAnyValue(state)
				continue
		}
		break
	}

	return result
}

/** Consume and return an identifier or function token. [↗](https://drafts.csswg.org/css-syntax/#consume-an-identifier) */
const consumeIdentifierLikeToken = (state: State, tick: number, size: number) => {
	let isFunction = state.codeAt0 === cp.LEFT_PARENTHESIS

	return consumeAnyToken(
		isFunction ? tt.FUNCTION : tt.WORD,
		tick,
		size,
		isFunction ? consumeAnyValue(state) : 0,
		// state.dump,
	)
}

/** Consume and return a comment token. [↗](https://drafts.csswg.org/css-syntax/#consume-comment) */
const consumeCommentToken = (state: State, lead: number, size: number, edge: number) => {
	while (state.tick < state.text.length) {
		if (state.codeAt0 === cp.ASTERISK && state.codeAt1 === cp.SOLIDUS) {
			edge = consumeAnyValue(state) + consumeAnyValue(state)
			break
		}

		size += consumeAnyValue(state)
	}

	return consumeAnyToken(tt.COMMENT, lead, size, edge)
	// return consumeAnyToken(tt.COMMENT, lead, size, edge, state.dump)
}

/** Consumes and returns a space token. [↗](https://drafts.csswg.org/css-syntax/#whitespace-token-diagram) */
const consumeSpaceToken = (state: State, lead: number, size: number) => {
	while (state.tick < state.text.length) {
		if (is.space[state.codeAt0]) size += consumeAnyValue(state)
		else break
	}

	return consumeAnyToken(tt.SPACE, lead, size, 0)
	// return consumeAnyToken(tt.SPACE, lead, size, 0, state.dump)
}

/** Consumes and returns a string token. [↗](https://drafts.csswg.org/css-syntax/#string-token-diagram) */
const consumeStringToken = (state: State, code: number, lead: number, size: number, edge: number) => {
	while (state.tick < state.text.length) {
		switch (true) {
			case state.codeAt0 === cp.REVERSE_SOLIDUS:
				size += consumeAnyValue(state)
			default:
				size += consumeAnyValue(state)
				continue
			case state.codeAt0 === code:
				edge = consumeAnyValue(state)
		}
		break
	}

	return consumeAnyToken(tt.STRING, lead, size, edge)
	// return consumeAnyToken(tt.STRING, lead, size, edge, state.dump)
}

// const consumeAnyToken = (type: number, lead: number, size: number, edge: number, style: string): Token => ({
const consumeAnyToken = (type: number, lead: number, size: number, edge: number): Token => ({
	token: type,
	enter: lead,
	split: lead + size,
	leave: lead + size + edge,
})

/** Consumes and returns a number value after an additive symbol. [↗](https://drafts.csswg.org/css-syntax/#consume-a-number) */
const consumeNumberSansAdditiveValue = (state: State) => {
	let size = consumeDigitValue(state)

	if (
		state.codeAt0 === cp.FULL_STOP &&
		is.digit[state.codeAt1]
	) {
		size += consumeAnyValue(state) + consumeAnyValue(state) + consumeDigitValue(state)
	}

	return size + consumeNumberSansDecimalValue(state)
}

/** Consumes and returns a number value after a decimal place. [↗](https://drafts.csswg.org/css-syntax/#consume-a-number) */
const consumeNumberSansDecimalValue = (state: State) => {
	let size = consumeDigitValue(state)

	if (state.codeAt0 === cp.LATIN_CAPITAL_LETTER_E || state.codeAt0 === cp.LATIN_SMALL_LETTER_E) {
		switch (true) {
			case state.codeAt1 === cp.PLUS_SIGN:
			case state.codeAt1 === cp.HYPHEN_MINUS:
				if (!is.digit[state.codeAt2]) break

				size += consumeAnyValue(state)

			case is.digit[state.codeAt1]:
				size += consumeAnyValue(state) + consumeAnyValue(state) + consumeDigitValue(state)
		}
	}

	return size
}

/** Consumes and returns a digit value. [↗](https://drafts.csswg.org/css-syntax/#consume-a-number) */
const consumeDigitValue = (state: State) => {
	let size = 0

	while (state.tick < state.text.length) {
		if (!is.digit[state.codeAt0]) break

		size += consumeAnyValue(state)
	}

	return size
}

/** Consumes and returns a numeric unit value. [↗](https://drafts.csswg.org/css-syntax/#consume-numeric-token) */
const consumeNumericUnitValue = (state: State) => (
	state.codeAt0 === cp.HYPHEN_MINUS
		? state.codeAt1 === cp.HYPHEN_MINUS
			? consumeAnyValue(state) + consumeAnyValue(state) + consumeIdentifierValue(state)
		: is.identifierStart[state.codeAt1] || !is.ascii[state.codeAt1]
			? consumeAnyValue(state) + consumeAnyValue(state) + consumeIdentifierValue(state)
		: is.validEscape(state.codeAt1, state.codeAt2)
			? consumeAnyValue(state) + consumeAnyValue(state) + consumeAnyValue(state) + consumeIdentifierValue(state)
		: 0
	: state.codeAt0 === cp.PERCENT_SIGN
		? consumeAnyValue(state)
	: is.identifierStart[state.codeAt0] || !is.ascii.hasOwnProperty(state.codeAt0)
		? consumeAnyValue(state) + consumeIdentifierValue(state)
	: is.validEscape(state.codeAt0, state.codeAt1)
		? consumeAnyValue(state) + consumeAnyValue(state) + consumeIdentifierValue(state)
	: 0
)
