var TAB  = 0x0009
var SP   = 0x0020
var LF   = 0x000A
var FF   = 0x000C
var CR   = 0x000D
var DBLQ = 0x0022
var HASH = 0x0023
var SNGQ = 0x0027
var STAR = 0x002A
var PLUS = 0x002B
var DASH = 0x002D
var STOP = 0x002E
var FS   = 0x002F
var ZERO = 0x0030
var NINE = 0x0039
var UP_A = 0x0041
var UP_E = 0x0045
var UP_Z = 0x005A
var BS   = 0x005C
var LDSH = 0x005F
var LC_A = 0x0061
var LC_E = 0x0065
var LC_Z = 0x007A
var CTRL = 0x0080
var COMMENT_TOKEN = 0x0041
var SPACE_TOKEN   = 0x0009
var NUMBER_TOKEN  = 0x0039
var NAME_TOKEN    = 0x0045
var HASH_TOKEN    = 0x005A
var STRING_TOKEN  = 0x0022

module.exports = tokenizer

function tokenizer(css, cb) {
	var len = css.length
	var old = 0
	var pos = 0
	var tokens = []
	var cp0
	var cp1
	var cp2
	var cp3
	var typ
	while (pos < len) {
		cp0 = css.charCodeAt(pos + 0) || 0
		typ = cp0
		switch (cp0) {
			// comment
			case FS:
				cp1 = css.charCodeAt(pos + 1)
				switch (cp1) {
					case STAR:
						consumeComment(2)
						break
					default:
						++pos
				}
				break
			// whitespace
			case TAB:
			case SP:
			case LF:
			case FF:
			case CR:
				consumeWhitespace(1)
				break
			// string
			case DBLQ:
			case SNGQ:
				consumeString(1)
				break
			// name or delimiter
			case HASH:
				cp1 = css.charCodeAt(pos + 1)
				switch (cp1) {
					// hyphen-minus
					case DASH:
					// digit
					case ZERO:
					case NINE:
					// letter
					case UP_A:
					case UP_Z:
					case LC_A:
					case LC_Z:
					// low-line
					case LDSH:
					// non-ascii
					case cp1 > CTRL && cp1:
					// letter
					case cp1 > UP_A && cp1 < UP_Z && cp1:
					case cp1 > LC_A && cp1 < LC_Z && cp1:
					// digit
					case cp1 > ZERO && cp1 < NINE && cp1:
						consumeName(2, HASH_TOKEN)
						break
					default:
						++pos
				}
				break
			// digit
			case PLUS:
			case DASH:
				cp1 = css.charCodeAt(pos + 1)
				switch (cp1) {
					// number-start: plus-minus: digit
					case ZERO:
					case NINE:
					// number-start: plus-minus: digit
					case cp1 > ZERO && cp1 < NINE && cp1:
						consumeNumber(2)
						break
					// number-start: plus-minus: full-stop
					case STOP:
						cp2 = css.charCodeAt(pos + 2)
						switch (cp2) {
							// number-start: plus-minus: full-stop: digit
							case ZERO:
							case NINE:
							case cp2 > ZERO && cp2 < NINE && cp2:
								consumeNumber(3, true)
								break
						}
						break
					// consume-name: valid escape
					case BS:
						cp2 = css.charCodeAt(pos + 2)
						switch (cp2) {
							case LF:
							case FF:
							case CR:
								break
							default:
								consumeName(3, NAME_TOKEN)
								break
						}
						break
					// consume-name: name: name-start: letters
					case UP_A:
					case UP_Z:
					case LC_A:
					case LC_Z:
					// consume-name: name: hypen-minus
					case DASH:
					// consume-name: name: name-start: low-ascii
					case LDSH:
					// consume-name: name: name-start: non-ascii
					case cp1 > CTRL && cp1:
					// consume-name: name: letters
					case cp1 > UP_A && cp1 < UP_Z && cp1:
					case cp1 > LC_A && cp1 < LC_Z && cp1:
						consumeName(1, NAME_TOKEN)
						break
					default:
						++pos
				}
				break
			case STOP:
				cp1 = css.charCodeAt(pos + 1)
				switch (cp1) {
					// number-start: full-stop: digit
					case ZERO:
					case NINE:
					case cp1 > ZERO && cp1 < NINE && cp1:
						consumeNumber(2, true)
						break
					default:
						++pos
				}
				break
			// name or delimiter
			case BS:
				cp1 = css.charCodeAt(pos + 1)
				switch (cp1) {
					// newline
					case LF:
					case FF:
					case CR:
						break
					default:
						consumeName(2, NAME_TOKEN)
						break
				}
				break
			// digit
			case ZERO:
			case NINE:
			case cp0 > ZERO && cp0 < NINE && cp0:
				consumeNumber(1)
				break
			// name-start: letter
			case UP_A:
			case UP_Z:
			case LC_A:
			case LC_Z:
			// name-start: low-dash
			case LDSH:
			// name-start: non-ascii
			case cp0 > CTRL && cp0:
			// name-start: letter
			case cp0 > UP_A && cp0 < UP_Z:
			case cp0 > UP_A && cp0 < UP_Z && cp0:
			case cp0 > LC_A && cp0 < LC_Z && cp0:
			// low-line
			case LDSH:
				consumeName(1, NAME_TOKEN)
				break
			default:
				pos += 1
				break
		}
		cb(typ, css.slice(old, pos), old, old = pos)
	}
	return tokens
	function consumeComment(shift) {
		capture: while (pos + shift < len) {
			cp0 = css.charCodeAt(pos + shift)
			cp1 = css.charCodeAt(pos + shift + 1)
			switch (cp0) {
				// whitespace
				case STAR:
					switch (cp1) {
						case FS:
							++shift
							++shift
							break capture
					}
			}
			++shift
			continue
		}
		pos += shift
		typ = COMMENT_TOKEN
	}
	function consumeWhitespace(shift) {
		while (pos + shift < len) {
			cp0 = css.charCodeAt(pos + shift)
			switch (cp0) {
				// whitespace
				case TAB:
				case SP:
				case LF:
				case FF:
				case CR:
					++shift
					continue
			}
			break
		}
		pos += shift
		typ = SPACE_TOKEN
	}
	function consumeNumber(shift, isDecimal, isScientific) {
		while (pos + shift < len) {
			cp0 = css.charCodeAt(pos + shift)
			switch (cp0) {
				// digit
				case ZERO:
				case NINE:
					++shift
					continue
				// digit
				case cp0 > ZERO && cp0 < NINE && cp0:
					++shift
					continue
				// full-stop
				case !isDecimal && STOP:
					cp1 = css.charCodeAt(pos + shift + 1)
					switch (cp1) {
						// full-stop: digit
						case ZERO:
						case NINE:
						// full-stop: digit
						case cp1 > ZERO && cp1 < NINE && cp1:
							++shift
							++shift
							isDecimal = true
							continue
					}
					break
				case !isScientific && UP_E:
				case !isScientific && LC_E:
					cp1 = css.charCodeAt(pos + shift + 1)
					switch (cp1) {
						// scientific: plus-minus
						case PLUS:
						case DASH:
							cp2 = css.charCodeAt(pos + shift + 2)
							switch (cp2) {
								case ZERO:
								case NINE:
								case cp2 > ZERO && cp2 < NINE && cp2:
									isDecimal = true
									isScientific = true
									++shift
									++shift
									++shift
									continue
							}
							break
						case ZERO:
						case NINE:
						case cp1 > ZERO && cp1 < NINE && cp1:
							isScientific = true
							++shift
							++shift
							continue
					}
			}
			break
		}
		pos += shift
		typ = NUMBER_TOKEN
	}
	function consumeName(shift, name) {
		while (pos + shift < len) {
			cp0 = css.charCodeAt(pos + shift)
			switch (cp0) {
				// valid escape
				case BS:
					cp1 = css.charCodeAt(pos + shift + 1)
					switch (cp3) {
						case LF:
						case FF:
						case CR:
							break
						default:
							++shift
							++shift
							continue
					}
					break
				// name: name-start: letter
				case UP_A:
				case UP_Z:
				case LC_A:
				case LC_Z:
				// name: name-start: low-line
				case LDSH:
				// name: digit
				case ZERO:
				case NINE:
				// name: hyphen-minus
				case DASH:
				case cp0 > ZERO && cp0 < NINE && cp0:
				// name: name-start: non-ascii
				case cp0 > CTRL && cp0:
				// name: name-start: letter
				case cp0 > UP_A && cp0 < UP_Z && cp0:
				case cp0 > LC_A && cp0 < LC_Z && cp0:
					++shift
					continue
			}
			break
		}
		pos += shift
		typ = name
	}
	function consumeString(shift) {
		var END = cp0
		while (pos + shift < len) {
			cp0 = css.charCodeAt(pos + shift)
			switch (cp0) {
				case END:
					++shift
					break
				case BS:
					if (pos + shift + 1 < len) ++shift
				default:
					++shift
					continue
			}
			break
		}
		pos += shift
		typ = STRING_TOKEN
	}
}
