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
			if (is.identifier(state.codeAt1)) return [
				state.tick,
				tt.HASH,
				consumeAnyValue(state),
				consumeAnyValue(state) + consumeIdentifierValue(state),
				'',
			] as CSSValue
			// #\:
			if (is.validEscape(state.codeAt1, state.codeAt2)) return [
				state.tick,
				tt.HASH,
				consumeAnyValue(state),
				consumeAnyValue(state) + consumeAnyValue(state) + consumeIdentifierValue(state),
				'',
			] as CSSValue
			break
		/* <ident-token> */
		/* https://drafts.csswg.org/css-syntax/#ident-token-diagram */
		case state.codeAt0 === cp.REVERSE_SOLIDUS:
			if (is.validEscape(state.codeAt0, state.codeAt1)) return consumeIdentifierLikeToken(state, [
				state.tick,
				tt.IDENT,
				'',
				consumeAnyValue(state) + consumeAnyValue(state) + consumeAnyValue(state) + consumeIdentifierValue(state),
				'',
			])
			break
		case is.identifierStart(state.codeAt0):
			// W
			return consumeIdentifierLikeToken(state, [
				state.tick,
				tt.IDENT,
				'',
				consumeAnyValue(state) + consumeIdentifierValue(state),
				''
			])
		case state.codeAt0 === cp.HYPHEN_MINUS:
			// -W
			if (state.codeAt1 === cp.HYPHEN_MINUS || is.identifierStart(state.codeAt1)) return consumeIdentifierLikeToken(state, [
				state.tick,
				tt.IDENT,
				'',
				consumeAnyValue(state) + consumeAnyValue(state) + consumeIdentifierValue(state),
				'',
			])
			// -\:
			if (is.validEscape(state.codeAt1, state.codeAt2)) return consumeIdentifierLikeToken(state, [
				state.tick,
				tt.IDENT,
				'',
				consumeAnyValue(state) + consumeAnyValue(state) + consumeAnyValue(state) + consumeIdentifierValue(state),
				'',
			])
		/* <number-token> */
		/* https://drafts.csswg.org/css-syntax/#number-token-diagram */
			// -8
			if (is.digit(state.codeAt1)) return [
				state.tick,
				tt.NUMERIC,
				'',
				consumeAnyValue(state) + consumeAnyValue(state) + consumeNumberSansAdditiveValue(state),
				consumeNumericUnitValue(state),
			] as CSSValue
			// -.8
			if (state.codeAt1 === cp.FULL_STOP && is.digit(state.codeAt2)) return [
				state.tick,
				tt.NUMERIC,
				'',
				consumeAnyValue(state) + consumeAnyValue(state) + consumeAnyValue(state) + consumeNumberSansDecimalValue(state),
				consumeNumericUnitValue(state),
			] as CSSValue
		case state.codeAt0 === cp.FULL_STOP:
			// .8
			if (is.digit(state.codeAt1)) return [
				state.tick,
				tt.NUMERIC,
				'',
				consumeAnyValue(state) + consumeAnyValue(state) + consumeNumberSansDecimalValue(state),
				consumeNumericUnitValue(state),
			] as CSSValue
			break
		case state.codeAt0 === cp.PLUS_SIGN:
			// +8
			if (is.digit(state.codeAt1)) return [
				state.tick,
				tt.NUMERIC,
				'',
				consumeAnyValue(state) + consumeAnyValue(state) + consumeNumberSansAdditiveValue(state),
				consumeNumericUnitValue(state),
			] as CSSValue
			// +.8
			if (state.codeAt1 === cp.FULL_STOP && is.digit(state.codeAt2)) return [
				state.tick,
				tt.NUMERIC,
				'',
				consumeAnyValue(state) + consumeAnyValue(state) + consumeAnyValue(state) + consumeNumberSansDecimalValue(state),
				consumeNumericUnitValue(state),
			] as CSSValue
			break
		case is.digit(state.codeAt0):
			// 8
			return [
				state.tick,
				tt.NUMERIC,
				'',
				consumeAnyValue(state) + consumeNumberSansAdditiveValue(state),
				consumeNumericUnitValue(state),
			] as CSSValue
		/* <atident-token> */
		/* https://drafts.csswg.org/css-syntax/#at-keyword-token-diagram */
		case state.codeAt0 === cp.COMMERCIAL_AT:
			if (state.codeAt1 === cp.HYPHEN_MINUS) {
				// @--
				if (state.codeAt2 === cp.HYPHEN_MINUS) return [
					state.tick,
					tt.ATIDENT,
					consumeAnyValue(state),
					consumeAnyValue(state) + consumeAnyValue(state) + consumeIdentifierValue(state),
					'',
				] as CSSValue
				// @-W
				if (is.identifierStart(state.codeAt2)) return [
					state.tick,
					tt.ATIDENT,
					consumeAnyValue(state),
					consumeAnyValue(state) + consumeAnyValue(state) + consumeIdentifierValue(state),
					'',
				] as CSSValue
				// @-\:
				if (is.validEscape(state.codeAt2, state.codeAt3)) return [
					state.tick,
					tt.ATIDENT,
					consumeAnyValue(state),
					consumeAnyValue(state) + consumeAnyValue(state) + consumeAnyValue(state) + consumeIdentifierValue(state),
					'',
				] as CSSValue
			}
			// @W
			if (is.identifierStart(state.codeAt1)) return [
				state.tick,
				tt.ATIDENT,
				consumeAnyValue(state),
				consumeAnyValue(state) + consumeIdentifierValue(state),
				'',
			] as CSSValue
			// @\:
			if (is.validEscape(state.codeAt1, state.codeAt2)) return [
				state.tick,
				tt.ATIDENT,
				consumeAnyValue(state),
				consumeAnyValue(state) + consumeAnyValue(state) + consumeIdentifierValue(state),
				'',
			] as CSSValue
			break
	}
	/* <delim-token> */
	/* https://drafts.csswg.org/css-syntax/#typedef-delim-token */
	return [
		state.tick,
		state.codeAt0,
		'',
		consumeAnyValue(state),
		'',
	] as CSSValue
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
const consumeIdentifierLikeToken = (state: CSSState, value: CSSValue) => {
	if (state.codeAt0 === cp.LEFT_PARENTHESIS) {
		value[1] = tt.FUNCTION
		value[4] = '('
		state.next()
	}
	return value
}

/** Consume and return a comment token. [↗](https://drafts.csswg.org/css-syntax/#consume-comment) */
const consumeCommentToken = (state: CSSState) => {
	const value: CSSValue = [ state.tick, tt.COMMENT, '/*', '', '' ]
	state.next()
	state.next()
	while (state.tick < state.size) {
		// @ts-ignore
		if (state.codeAt0 === cp.ASTERISK && state.codeAt1 === cp.SOLIDUS) {
			value[4] = '*/'
			state.next()
			state.next()
			break
		}
		value[3] += consumeAnyValue(state)
	}
	return value
}

/** Consumes and returns a space token. [↗](https://drafts.csswg.org/css-syntax/#whitespace-token-diagram) */
const consumeSpaceToken = (state: CSSState) => {
	const value: CSSValue = [ state.tick, tt.SPACE, '', consumeAnyValue(state), '' ]
	while (state.tick < state.size) {
		if (!is.space(state.codeAt0)) break
		value[3] += consumeAnyValue(state)
	}
	return value
}

/** Consumes and returns a string token. [↗](https://drafts.csswg.org/css-syntax/#string-token-diagram) */
const consumeStringToken = (state: CSSState) => {
	const { codeAt0 } = state
	const value: CSSValue = [ state.tick, tt.STRING, consumeAnyValue(state), '', '' ]
	while (state.tick < state.size) {
		switch (true) {
			case is.validEscape(state.codeAt0, state.codeAt1):
				value[3] += consumeAnyValue(state)
			default:
				value[3] += consumeAnyValue(state)
				continue
			case state.codeAt0 === codeAt0:
				value[4] = consumeAnyValue(state)
		}
		break
	}
	return value
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
