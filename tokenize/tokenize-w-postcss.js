var TAB  = 0x0009 // ␉ ===   9
var LF   = 0x000A // ␊ ===  10
var FF   = 0x000C // ␌ ===  12
var CR   = 0x000D // ␍ ===  13
var PCNT = 0x0025 // % ===  25
var SP   = 0x0020 // ␠ ===  32
var DBLQ = 0x0022 // " ===  34
var HASH = 0x0023 // # ===  35
var SNGQ = 0x0027 // ' ===  39
var L_RB = 0x0028 // ( ===  40
var STAR = 0x002A // * ===  42
var PLUS = 0x002B // + ===  43
var DASH = 0x002D // - ===  45
var STOP = 0x002E // . ===  46
var FS   = 0x002F // / ===  47
var ZERO = 0x0030 // 0 ===  48
var NINE = 0x0039 // 9 ===  57
var AT   = 0x0040 // @ ===  64
var UP_A = 0x0041 // A ===  65
var UP_E = 0x0045 // E ===  69
var UP_Z = 0x005A // Z ===  90
var BS   = 0x005C // \ ===  92
var LDSH = 0x005F // _ ===  95
var LC_A = 0x0061 // a ===  97
var LC_E = 0x0065 // e === 101
var LC_Z = 0x007A // z === 122
var CTRL = 0x0080 // � === 128

var BANG = 0x0021 // ! ===  33
var AMPR = 0x0026 // & ===  38
var COLO = 0x003A // : ===  58
var SEMI = 0x003B // ; ===  59
var UP_C = 0x0043 // C ===  67
var UP_F = 0x0046 // F ===  70
var UP_H = 0x0048 // H ===  72
var UP_N = 0x004E // N ===  78

var SPACE_TYPE    = 0x0009 // ␠ ===  32
var STRING_TYPE   = 0x0022 // " ===  34
var NUMBER_TYPE   = 0x0030 // 0 ===  48
var AT_TYPE       = 0x0041 // A ===  65
var COMMENT_TYPE  = 0x0043 // C ===  67
var FUNCTION_TYPE = 0x0046 // F ===  70
var HASH_TYPE     = 0x0048 // H ===  72
var NAME_TYPE     = 0x004E // N ===  78

module.exports = tokenize

/**
 * Reads CSS and executes a function for each captured token.
 * @param {string} css - CSS being tokenized.
 */
function tokenize(css) {
	/** @type {number} Length of character codes that can be consumed. */
	var size = css.length

	/** @type {number} Starting index within the CSS of the current token. */
	var open = 0

	/** @type {number} Ending index within the CSS of the current token. */
	var shut = 0

	/** @type {number} Number of offset characters between the token value and its opening delimiter. */
	var lead

	/** @type {number} Number of offset characters between the token value and its closing delimiter. */
	var tail

	/** @type {number} Identifying ID of current token. */
	var type

	/** @type {number} Current character code. */
	var cc0

	/** @type {number} Next character code. */
	var cc1

	/** @type {boolean} Whether the tokenizer is done. */
	var done = size === 0

	var tokens = {
		deja: deja,
		done: done,
		next: next,
		rootCSS: rootCSS,
		leadCSS: leadCSS,
		tailCSS: tailCSS
	}

	function leadCSS() {
		return css.slice(tokens.open, tokens.open + tokens.lead)
	}

	function rootCSS() {
		return css.slice(tokens.open + tokens.lead, tokens.shut - tokens.tail)
	}

	function tailCSS() {
		return css.slice(tokens.shut - tokens.tail, tokens.shut)
	}

	return tokens

	function deja() {
		var lastNext = tokens.next
		tokens.next = function () {
			tokens.next = lastNext
			return !done
		}
		return !done
	}

	/** Consume a token */
	function next() {
		cc0 = css.charCodeAt(shut)
		done = isNaN(cc0)
		type = done ? -1 : cc0
		lead = 0
		tail = 0

		switch (true) {
			/* Comment or Delimiter */
			case cc0 === FS:
				++shut
				if (css.charCodeAt(shut) === STAR) {
					type = COMMENT_TYPE
					lead = 2
					while (++shut < size) {
						if (
							css.charCodeAt(shut) === STAR &&
							css.charCodeAt(shut + 1) === FS
						) {
							++shut
							++shut
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
				while (++shut < size) {
					cc1 = css.charCodeAt(shut)
					if (cc1 === BS) {
						if (shut + 1 < size) {
							++shut
						}
						continue
					}
					if (cc1 === cc0) {
						++shut
						tail = 1
						break
					}
				}
				break

			/* Hash-Identifier or Delimiter */
			case cc0 === HASH:
				++shut
				if (
					shut < size &&
					isIdentifier(css.charCodeAt(shut))
				) {
					type = HASH_TYPE
					shut += (lead = 1)
					consumeIdentifier()
				}
				break

			/* Number or Named Identifier or Delimiter */
			case cc0 === DASH:
				cc0 = css.charCodeAt(shut + 1)
				if (
					(cc0 === DASH && ++shut) ||
					(isIdentifierStart(cc0) && ++shut) ||
					(cc0 === BS && !isVerticalSpace(css.charCodeAt(shut + 2)) && ++shut && ++shut)
				) {
					type = NAME_TYPE
					++shut
					consumeIdentifier()
					break
				}

			/* Number or Delimiter */
			case cc0 === PLUS:
				++shut
				cc0 = css.charCodeAt(shut)
				if (cc0 && isInteger(cc0)) {
					type = NUMBER_TYPE
					++shut
					consumeNumber()
				} else if (cc0 === STOP) {
					cc0 = css.charCodeAt(shut + 1)
					if (cc0 && isInteger(cc0)) {
						type = NUMBER_TYPE
						++shut
						++shut
						consumeNumber(1)
					}
				}
				break

			/* Number or Delimiter */
			case cc0 === STOP:
				++shut
				if (isInteger(css.charCodeAt(shut))) {
					type = NUMBER_TYPE
					++shut
					consumeNumber(1)
				}
				break

			/* Identifier or Delimiter */
			case cc0 === BS:
				++shut
				if (!isVerticalSpace(css.charCodeAt(shut))) {
					type = NAME_TYPE
					++shut
					consumeIdentifier()
				}
				break

			/* Space */
			case isVerticalSpace(cc0):
			case isHorizontalSpace(cc0):
				do {
					++shut
					cc0 = css.charCodeAt(shut)
				} while (
					isHorizontalSpace(cc0) ||
					isVerticalSpace(cc0)
				)
				type = SPACE_TYPE
				break

			/* At-Identifier or Delimiter */
			case cc0 === AT:
				++shut
				if (
					shut < size &&
					isIdentifier(css.charCodeAt(shut))
				) {
					type = AT_TYPE
					shut += (lead = 1)
					consumeIdentifier()
				}
				break

			/* Identifier or Function */
			case isIdentifierStart(cc0):
				type = NAME_TYPE
				++shut
				consumeIdentifier()
				if (css.charCodeAt(shut) === L_RB) {
					type = FUNCTION_TYPE
					tail = 1
					++shut
				}
				break

			/* Number */
			case isInteger(cc0):
				type = NUMBER_TYPE
				++shut
				consumeNumber()
				break

			/* Delimiter */
			default:
				++shut
				break
		}

		tokens.done = done
		tokens.type = type
		tokens.open = open
		tokens.shut = open = shut
		tokens.lead = lead
		tokens.tail = tail

		return !done
	}

	/** Consume an identifier. */
	function consumeIdentifier() {
		while (shut < size) {
			if (
				(
					isIdentifier(css.charCodeAt(shut)) &&
					++shut
				) ||
				(
					css.charCodeAt(shut) === BS &&
					!isVerticalSpace(css.charCodeAt(shut + 1)) &&
					++shut &&
					++shut
				)
			) {
				continue
			}
			break
		}
	}

	/** Consume a number. */
	function consumeNumber(isDecimal, isScientific) {
		while (shut < size) {
			if (
				(
					isInteger(css.charCodeAt(shut)) &&
					++shut
				) ||
				(
					!isDecimal &&
					css.charCodeAt(shut) === STOP &&
					isInteger(css.charCodeAt(shut + 1)) &&
					(isDecimal = 1) &&
					++shut &&
					++shut
				) ||
				(
					!isScientific &&
					(cc1 = css.charCodeAt(shut)) &&
					(cc1 === UP_E || cc1 === LC_E) &&
					(cc1 = css.charCodeAt(shut + 1)) &&
					(
						(
							isInteger(cc1) &&
							++shut
						) || (
							(cc1 === PLUS || cc1 === DASH) &&
							isInteger(css.charCodeAt(shut + 1)) &&
							++shut &&
							++shut
						)
					) &&
					(isScientific = 1)
				)
			) {
				continue
			}
			break
		}
		tail = shut
		if (css.charCodeAt(shut) === PCNT) ++shut
		else consumeIdentifier()
		tail = tail === shut ? 0 : shut - tail
	}
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
		(cc >= CTRL) ||
		(cc >= UP_A && cc <= UP_Z) ||
		(cc >= LC_A && cc <= LC_Z)
	)
}

/** Returns whether the character code is a low-dash, dash, non-ASCII, number, or letter. */
function isIdentifier(cc) {
	return (
		(cc === LDSH) ||
		(cc === DASH) ||
		(cc >= CTRL) ||
		(cc >= ZERO && cc <= NINE) ||
		(cc >= UP_A && cc <= UP_Z) ||
		(cc >= LC_A && cc <= LC_Z)
	)
}

/**
* Callback function executed for each token.
* @callback callback
* @param {number} type - Identifying ID of current token.
* @param {number} open - Starting index within the CSS of the current token.
* @param {number} shut - Ending index within the CSS of the current token.
* @param {number} lead - Offset length between the token value and its opening delimiter, which is zero if there is none.
* @param {number} tail - Offset length between the token value and its closing delimiter, which is zero if there is none.
*/
