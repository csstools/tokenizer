var TAB  = 0x0009
var SP   = 0x0020
var LF   = 0x000A
var FF   = 0x000C
var CR   = 0x000D
var DBLQ = 0x0022
var HASH = 0x0023
var SNGQ = 0x0027
var L_RB = 0x0028
var STAR = 0x002A
var PLUS = 0x002B
var DASH = 0x002D
var STOP = 0x002E
var FS   = 0x002F
var ZERO = 0x0030
var NINE = 0x0039
var AT   = 0x0040
var UP_A = 0x0041
var UP_E = 0x0045
var UP_Z = 0x005A
var BS   = 0x005C
var LDSH = 0x005F
var LC_A = 0x0061
var LC_E = 0x0065
var LC_Z = 0x007A
var CTRL = 0x0080

var SPACE_TYPE   = 0x0009 // ↹ ===   9
var STRING_TYPE  = 0x0022 // " ===  34
var NUMBER_TYPE  = 0x0030 // 0 ===  48
var COMMENT_TYPE = 0x0041 // A ===  65
var NAME_TYPE    = 0x0045 // E ===  69
var HASH_TYPE    = 0x005A // Z ===  90
var FUNC_TYPE    = 0x0065 // e === 101
var AT_TYPE      = 0x007A // z === 122

module.exports = tokenize

/**
 * Reads CSS and executes a function for each captured token.
 * @param {string} css - CSS being tokenized.
 * @param {callback} consumer - Object of callbacks executed for each token.
 */
function tokenize(css, consumer) {
	var size = css.length

	/** @type {number} Starting index within the CSS of the current token. */
	var prev = 0

	/** @type {number} Ending index within the CSS of the current token. */
	var spot = 0

	/** @type {number} Number of offset characters between the token value and its opening delimiter. */
	var lead

	/** @type {number} Number of offset characters between the token value and its closing delimiter. */
	var tail

	/** @type {TokenType} Identifying ID of current token. */
	var type
	var cc0

	while (spot < size) {
		cc0 = css.charCodeAt(spot)
		type = cc0
		lead = 0
		tail = 0

		switch (true) {
			/* Comment or Delimiter */
			case cc0 === FS:
				++spot
				if (css.charCodeAt(spot) === STAR) {
					type = COMMENT_TYPE
					lead = 2
					while (++spot < size) {
						if (
							css.charCodeAt(spot) === STAR &&
							css.charCodeAt(spot + 1) === FS
						) {
							++spot
							++spot
							tail = 2
							break
						}
					}
				}
				break

			/* String */
			case cc0 === DBLQ:
			case cc0 === SNGQ:
				type = STRING_TYPE
				lead = 1
				while (++spot < size) {
					cc1 = css.charCodeAt(spot)
					if (cc1 === BS) {
						if (spot + 1 < size) {
							++spot
						}
						continue
					}
					if (cc1 === cc0) {
						++spot
						tail = 1
						break
					}
				}
				break

			/* Hash-Identifier or Delimiter */
			case cc0 === HASH:
				++spot
				if (
					spot < size &&
					isIdentifier(css.charCodeAt(spot))
				) {
					type = HASH_TYPE
					spot += (lead = 1)
					consumeIdentifier()
				}
				break

			/* Number or Named Identifier or Delimiter */
			case cc0 === DASH:
				cc0 = css.charCodeAt(spot + 1)
				if (
					(cc0 === DASH && ++spot) ||
					(isIdentifierStart(cc0) && ++spot) ||
					(cc0 === BS && !isVerticalSpace(css.charCodeAt(spot + 2)) && ++spot && ++spot)
				) {
					type = NAME_TYPE
					++spot
					consumeIdentifier()
					break
				}

			/* Number or Delimiter */
			case cc0 === PLUS:
				++spot
				cc0 = css.charCodeAt(spot)
				if (cc0 && isInteger(cc0)) {
					type = NUMBER_TYPE
					++spot
					consumeNumber()
				} else if (cc0 === STOP) {
					cc0 = css.charCodeAt(spot + 1)
					if (cc0 && isInteger(cc0)) {
						type = NUMBER_TYPE
						++spot
						++spot
						consumeNumber(1)
					}
				}
				break

			/* Number or Delimiter */
			case cc0 === STOP:
				++spot
				if (isInteger(css.charCodeAt(spot))) {
					type = NUMBER_TYPE
					++spot
					consumeNumber(1)
				}
				break

			/* Identifier or Delimiter */
			case cc0 === BS:
				++spot
				if (!isVerticalSpace(css.charCodeAt(spot))) {
					type = NAME_TYPE
					++spot
					consumeIdentifier()
				}
				break

			/* Space */
			case isVerticalSpace(cc0):
			case isHorizontalSpace(cc0):
				do {
					++spot
					cc0 = css.charCodeAt(spot)
				} while (
					isHorizontalSpace(cc0) ||
					isVerticalSpace(cc0)
				)
				type = SPACE_TYPE
				break

			/* At-Identifier or Delimiter */
			case cc0 === AT:
				++spot
				if (
					spot < size &&
					isIdentifier(css.charCodeAt(spot))
				) {
					type = AT_TYPE
					spot += (lead = 1)
					consumeIdentifier()
				}
				break

			/* Identifier or Function */
			case isIdentifierStart(cc0):
				type = NAME_TYPE
				++spot
				consumeIdentifier()
				if (css.charCodeAt(spot) === L_RB) {
					type = FUNC_TYPE
					tail = 1
					++spot
				}
				break

			/* Number */
			case isInteger(cc0):
				type = NUMBER_TYPE
				++spot
				consumeNumber()
				break

			/* Delimiter */
			default:
				++spot
				break
		}

		consumer = consumer.call(this, type, prev, prev = spot, lead, tail)
	}

	function consumeIdentifier() {
		while (spot < size) {
			if (
				(
					isIdentifier(css.charCodeAt(spot)) &&
					++spot
				) ||
				(
					css.charCodeAt(spot) === BS &&
					!isVerticalSpace(css.charCodeAt(spot + 1)) &&
					++spot &&
					++spot
				)
			) {
				continue
			}
			break
		}
	}

	/** Consume all possible numbers. */
	function consumeNumber(isDecimal, isScientific) {
		while (spot < size) {
			if (
				(
					isInteger(css.charCodeAt(spot)) &&
					++spot
				) ||
				(
					!isDecimal &&
					css.charCodeAt(spot) === STOP &&
					isInteger(css.charCodeAt(spot + 1)) &&
					(isDecimal = 1) &&
					++spot &&
					++spot
				) ||
				(
					!isScientific &&
					(cc1 = css.charCodeAt(spot)) &&
					(cc1 === UP_E || cc1 === LC_E) &&
					(cc1 = css.charCodeAt(spot + 1)) &&
					(
						(
							isInteger(cc1) &&
							++spot
						) || (
							(cc1 === PLUS || cc1 === DASH) &&
							isInteger(css.charCodeAt(spot + 1)) &&
							++spot &&
							++spot
						)
					) &&
					(isScientific = 1)
				)
			) {
				continue
			}
			break
		}
		tail = spot
		consumeIdentifier()
		tail = tail === spot ? 0 : spot - tail
	}

	return this
}

function isVerticalSpace(cc) {
	return cc === LF || cc === FF || cc === CR
}

function isHorizontalSpace(cc) {
	return cc === TAB || cc === SP
}

function isInteger(cc) {
	return cc >= ZERO && cc <= NINE
}

/** Returns whether the character code is a low-dash, non-ASCII, or letter. */
function isIdentifierStart(cc) {
	return (
		(cc === LDSH) ||
		(cc > CTRL) ||
		(cc >= UP_A && cc <= UP_Z) ||
		(cc >= LC_A && cc <= LC_Z)
	)
}

/** Returns whether the character code is a low-dash, dash, non-ASCII, number, or letter. */
function isIdentifier(cc) {
	return (
		(cc === LDSH) ||
		(cc === DASH) ||
		(cc > CTRL) ||
		(cc >= ZERO && cc <= NINE) ||
		(cc >= UP_A && cc <= UP_Z) ||
		(cc >= LC_A && cc <= LC_Z)
	)
}

/**
* @typedef {0x0009} WhitespaceTokenType
* @typedef {0x0022} StringTokenType
* @typedef {0x0030} NumberTokenType
* @typedef {0x0041} CommentTokenType
* @typedef {0x0045} NamedIdentifierTokenType
* @typedef {0x005A} HashIdentifierTokenType
* @typedef {0x0065} FunctionTokenType
* @typedef {0x007A} AtIdentifierTokenType
* @typedef {WhitespaceTokenType | StringTokenType | NumberTokenType | CommentTokenType | NamedIdentifierTokenType | HashIdentifierTokenType | FunctionTokenType | AtIdentifierTokenType} TokenType - Identifying ID of current token.
*/

/**
* Callback function executed for each token.
* @callback callback
* @param {TokenType} type - Identifying ID of current token.
* @param {number} open - Starting index within the CSS of the current token.
* @param {string} shut - Ending index within the CSS of the current token.
* @param {number} lead - Offset length between the token value and its opening delimiter, which is zero if there is none.
* @param {number} tail - Offset length between the token value and its closing delimiter, which is zero if there is none.
*/
