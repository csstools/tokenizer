import { State, Token } from '../src/parse'

import * as cp from '../.wip/char-points.js'
import * as is from '../.wip/parse.is.js'
import * as pt from '../.wip/parse.types.js'

/** Consumes and returns a token. [↗](https://drafts.csswg.org/css-syntax/#consume-token) */
export const consume = (state: State) => {
	switch (true) {
		/* <comment-token>
		/* https://drafts.csswg.org/css-syntax/#consume-comment */
		case state.charAt0 === cp.SOLIDUS:
			if (state.charAt1 === cp.ASTERISK) return consumeCommentToken(state)
			break

		/* <space-token>
		/* https://drafts.csswg.org/css-syntax/#whitespace-token-diagram */
		case is.space[state.charAt0]:
			return consumeSpaceToken(state)

		/* <string-token>
		/* https://drafts.csswg.org/css-syntax/#string-token-diagram */
		case state.charAt0 === cp.QUOTATION_MARK:
		case state.charAt0 === cp.APOSTROPHE:
			// "" || ''
			return consumeStringToken(state)

		/* <hash-token>
		/* https://drafts.csswg.org/css-syntax/#hash-token-diagram */
		case state.charAt0 === cp.NUMBER_SIGN:
			// #W
			if (is.identifier[state.charAt1] || !is.ascii[state.charAt1]) return consumeAnyToken(
				pt.CSSHash,
				state,
				[ consumeAnyValue, consumeAnyValue, consumeIdentifierValue ],
				[]
			)
			// #\!
			if (is.validEscape(state.charAt1, state.charAt2)) return consumeAnyToken(
				pt.CSSHash,
				state,
				[ consumeAnyValue, consumeAnyValue, consumeAnyValue, consumeIdentifierValue ],
				[]
			)
			break

		/* <ident-token> */
		/* https://drafts.csswg.org/css-syntax/#ident-token-diagram */
		case state.charAt0 === cp.REVERSE_SOLIDUS:
			if (is.validEscape(state.charAt0, state.charAt1)) return consumeIdentifierLikeToken(
				state,
				[ consumeAnyValue, consumeAnyValue, consumeAnyValue, consumeIdentifierValue ]
			)
			break
		case is.identifierStart[state.charAt0]:
		case !is.ascii[state.charAt0]:
			// W
			return consumeIdentifierLikeToken(state, [ consumeAnyValue, consumeIdentifierValue ])
		case state.charAt0 === cp.HYPHEN_MINUS:
			// -W
			if (state.charAt1 === cp.HYPHEN_MINUS || is.identifierStart[state.charAt1] || !is.ascii[state.charAt1]) return consumeIdentifierLikeToken(state, [ consumeAnyValue,  consumeAnyValue, consumeIdentifierValue ])
			// -\!
			if (is.validEscape(state.charAt1, state.charAt2)) return consumeIdentifierLikeToken(state, [ consumeAnyValue, consumeAnyValue, consumeAnyValue, consumeIdentifierValue ])

		/* <number-token> */
		/* https://drafts.csswg.org/css-syntax/#number-token-diagram */
			// -8
			if (is.digit[state.charAt1]) return consumeAnyToken(
				pt.CSSNumber,
				state,
				[ consumeAnyValue, consumeAnyValue, consumeNumberSansAdditiveValue ],
				[ consumeNumericUnitValue ],
			)
			// -.8
			if (state.charAt1 === cp.FULL_STOP && is.digit[state.charAt2]) return consumeAnyToken(
				pt.CSSNumber,
				state,
				[ consumeAnyValue, consumeAnyValue, consumeAnyValue, consumeNumberSansDecimalValue ],
				[ consumeNumericUnitValue ],
			)
		case state.charAt0 === cp.FULL_STOP:
			// .8
			if (is.digit[state.charAt1]) return consumeAnyToken(
				pt.CSSNumber,
				state,
				consumeAnyValue, consumeAnyValue, consumeNumberSansDecimalValue ],
				[ consumeNumericUnitValue ],
			)
			break
		case state.charAt0 === cp.PLUS_SIGN:
			// +8
			if (is.digit[state.charAt1]) return consumeAnyToken(
				pt.CSSNumber,
				state,
				[ consumeAnyValue, consumeAnyValue, consumeNumberSansAdditiveValue ],
				[ consumeNumericUnitValue ],
			)
			// +.8
			if (state.charAt1 === cp.FULL_STOP && is.digit[state.charAt2]) return consumeAnyToken(
				pt.CSSNumber,
				state,
				[ consumeAnyValue, consumeAnyValue, consumeAnyValue, consumeNumberSansDecimalValue ],
				[ consumeNumericUnitValue ],
			)
			break
		case is.digit[state.charAt0]:
			// 8
			return consumeAnyToken(
				pt.CSSNumber,
				state,
				[ consumeAnyValue, consumeNumberSansAdditiveValue ],
				[ consumeNumericUnitValue ],
			)

		/* <atident-token> */
		/* https://drafts.csswg.org/css-syntax/#at-keyword-token-diagram */
		case state.charAt0 === cp.COMMERCIAL_AT:
			if (state.charAt1 === cp.HYPHEN_MINUS) {
				// @--
				if (state.charAt2 === cp.HYPHEN_MINUS) return consumeAnyToken(
					pt.CSSAtWord,
					state,
					[ consumeAnyValue, consumeAnyValue, consumeAnyValue, consumeIdentifierValue ],
					[],
				)
				// @-W
				if (is.identifierStart[state.charAt2] || !is.ascii[state.charAt2]) return consumeAnyToken(
					pt.CSSAtWord,
					state,
					[ consumeAnyValue, consumeAnyValue, consumeAnyValue, consumeIdentifierValue ],
					[],
				)
				// @-\!
				if (is.validEscape(state.charAt2, state.charAt3)) return consumeAnyToken(
					pt.CSSAtWord,
					state,
					[ consumeAnyValue, consumeAnyValue, consumeAnyValue, consumeAnyValue, consumeIdentifierValue ],
					[],
				)
			}
			// @W
			if (is.identifierStart[state.charAt1] || !is.ascii[state.charAt1]) return consumeAnyToken(
				pt.CSSAtWord,
				state,
				[ consumeAnyValue, consumeAnyValue, consumeIdentifierValue ],
				[],
			)
			// @\!
			if (is.validEscape(state.charAt1, state.charAt2)) return consumeAnyToken(
				pt.CSSAtWord,
				state,
				[ consumeAnyValue, consumeAnyValue, consumeAnyValue, consumeIdentifierValue ],
				[],
			)
			break
	}

	/* <delim-token> */
	/* https://drafts.csswg.org/css-syntax/#typedef-delim-token */
	return consumeAnyToken(
		pt.CSSSymbol,
		state,
		[ consumeAnyValue ],
		[],
	)
}

/** Consume and return a value. [↗](https://drafts.csswg.org/css-syntax/#consume-token) */
const consumeAnyValue = (state: State) => {
	state.charAt0 = state.charAt1
	state.charAt1 = state.charAt2
	state.charAt2 = state.charAt3
	state.charAt3 = state.text.charAt(++state.tick + 3)

	return 1
}

/** Consume and return an identifier value. [↗](https://drafts.csswg.org/css-syntax/#consume-an-identifier) */
const consumeIdentifierValue = (state: State) => {
	let result = 0

	while (state.tick < state.text.length) {
		switch (true) {
			case is.validEscape(state.charAt0, state.charAt1):
				result += consumeAnyValue(state)

			case is.identifier[state.charAt0]:
			case !is.ascii[state.charAt0]:
				result += consumeAnyValue(state)
				continue
		}
		break
	}

	return result
}

/** Consume and return an identifier or function token. [↗](https://drafts.csswg.org/css-syntax/#consume-an-identifier) */
const consumeIdentifierLikeToken = (state: State, these: any[]) => {
	let lead = state.tick
	let size = 0

	for (let that of these) {
		size += that(state)
	}

	let isFunction = state.charAt0 === cp.LEFT_PARENTHESIS

	return consumeAnyToken(
		isFunction ? pt.CSSFunction : pt.CSSWord,
		state,
		size,
		isFunction ? consumeAnyValue(state) : 0,
	)
}

/** Consume and return a comment token. [↗](https://drafts.csswg.org/css-syntax/#consume-comment) */
const consumeCommentToken = (state: State) => {
	let lead = state.tick
	let size = consumeAnyValue(state) + consumeAnyValue(state)
	let edge = 0

	while (state.tick < state.text.length) {
		if (state.charAt0 === cp.ASTERISK && state.charAt1 === cp.SOLIDUS) {
			edge = consumeAnyValue(state) + consumeAnyValue(state)
			break
		}

		size += consumeAnyValue(state)
	}

	return consumeAnyToken(pt.CSSComment, lead, size, edge)
}

/** Consumes and returns a space token. [↗](https://drafts.csswg.org/css-syntax/#whitespace-token-diagram) */
const consumeSpaceToken = (state: State) => {
	let lead = state.tick
	let size = consumeAnyValue(state)

	while (state.tick < state.text.length) {
		if (is.space[state.charAt0]) size += consumeAnyValue(state)
		else break
	}

	return consumeAnyToken(pt.CSSSpace, lead, size, 0)
}

/** Consumes and returns a string token. [↗](https://drafts.csswg.org/css-syntax/#string-token-diagram) */
const consumeStringToken = (state: State) => {
	let char = state.charAt0
	let lead = state.tick
	let size = consumeAnyValue(state)
	let edge = 0

	while (state.tick < state.text.length) {
		switch (true) {
			case state.charAt0 === cp.REVERSE_SOLIDUS:
				size += consumeAnyValue(state)
			default:
				size += consumeAnyValue(state)
				continue
			case state.charAt0 === char:
				edge = consumeAnyValue(state)
		}
		break
	}

	return consumeAnyToken(pt.CSSString, lead, size, edge)
}

const consumeAnyToken = (type: pt.CSSToken, lead: number, size: number, edge: number): Token => ({
	token: type,
	enter: lead,
	split: lead + size,
	leave: lead + size + edge,
})

/** Consumes and returns a number value after an additive symbol. [↗](https://drafts.csswg.org/css-syntax/#consume-a-number) */
const consumeNumberSansAdditiveValue = (state: State) => {
	let size = consumeDigitValue(state)

	if (
		state.charAt0 === cp.FULL_STOP &&
		is.digit[state.charAt1]
	) {
		size += consumeAnyValue(state) + consumeAnyValue(state) + consumeDigitValue(state)
	}

	return size + consumeNumberSansDecimalValue(state)
}

/** Consumes and returns a number value after a decimal place. [↗](https://drafts.csswg.org/css-syntax/#consume-a-number) */
const consumeNumberSansDecimalValue = (state: State) => {
	let size = consumeDigitValue(state)

	if (state.charAt0 === cp.LATIN_CAPITAL_LETTER_E || state.charAt0 === cp.LATIN_SMALL_LETTER_E) {
		switch (true) {
			case state.charAt1 === cp.PLUS_SIGN:
			case state.charAt1 === cp.HYPHEN_MINUS:
				if (!is.digit[state.charAt2]) break

				size += consumeAnyValue(state)

			case is.digit[state.charAt1]:
				size += consumeAnyValue(state) + consumeAnyValue(state) + consumeDigitValue(state)
		}
	}

	return size
}

/** Consumes and returns a digit value. [↗](https://drafts.csswg.org/css-syntax/#consume-a-number) */
const consumeDigitValue = (state: State) => {
	let size = 0

	while (state.tick < state.text.length) {
		if (!is.digit[state.charAt0]) break

		size += consumeAnyValue(state)
	}

	return size
}

/** Consumes and returns a numeric unit value. [↗](https://drafts.csswg.org/css-syntax/#consume-numeric-token) */
const consumeNumericUnitValue = (state: State) => (
	state.charAt0 === cp.HYPHEN_MINUS
		? state.charAt1 === cp.HYPHEN_MINUS
			? consumeAnyValue(state) + consumeAnyValue(state) + consumeIdentifierValue(state)
		: is.identifierStart[state.charAt1] || !is.ascii[state.charAt1]
			? consumeAnyValue(state) + consumeAnyValue(state) + consumeIdentifierValue(state)
		: is.validEscape(state.charAt1, state.charAt2)
			? consumeAnyValue(state) + consumeAnyValue(state) + consumeAnyValue(state) + consumeIdentifierValue(state)
		: 0
	: state.charAt0 === cp.PERCENT_SIGN
		? consumeAnyValue(state)
	: is.identifierStart[state.charAt0] || !is.ascii.hasOwnProperty(state.charAt0)
		? consumeAnyValue(state) + consumeIdentifierValue(state)
	: is.validEscape(state.charAt0, state.charAt1)
		? consumeAnyValue(state) + consumeAnyValue(state) + consumeIdentifierValue(state)
	: 0
)
