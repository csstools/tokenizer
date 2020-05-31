var L_RB = 0x0028 // (
var R_RB = 0x0029 // )
var L_SB = 0x005B // [
var R_SB = 0x005D // ]
var L_CB = 0x007B // {
var R_CB = 0x007D // }

var SPACE_TYPE   = 0x0009 // ↹
var STRING_TYPE  = 0x0022 // "
var NUMBER_TYPE  = 0x0030 // 0
var COMMENT_TYPE = 0x0041 // A
var NAME_TYPE    = 0x0045 // E
var HASH_TYPE    = 0x005A // Z
var FUNC_TYPE    = 0x0065 // e
var AT_TYPE      = 0x007A // z

module.exports = (function (CSSOM, tokenize) {
	var CSSBlock = CSSOM.CSSBlock
	var CSSComment = CSSOM.CSSComment
	var CSSWhitespace = CSSOM.CSSWhitespace
	var CSSString = CSSOM.CSSString
	var CSSHashIdentifier = CSSOM.CSSHashIdentifier
	var CSSNumber = CSSOM.CSSNumber
	var CSSAtIdentifier = CSSOM.CSSAtIdentifier
	var CSSFunction = CSSOM.CSSFunction
	var CSSNamedIdentifier = CSSOM.CSSNamedIdentifier
	var CSSDelimiter = CSSOM.CSSDelimiter

	return parse

	/**
	* Reads CSS and parses it into an object model.
	* @param {string} css - CSS being tokenized.
	* @returns {CSSBlock} CSS Object Model.
	*/
	function parse(css) {
		var root = new CSSBlock('', '')
		var parent = root

		tokenize(css, function (type, open, shut, lead, tail) {
			switch (type) {
				// CSSComment
				case COMMENT_TYPE:
					parent.append(new CSSComment(css.slice(open + lead, shut - tail), tail ? '*/' : ''))
					break
				// CSSWhitespace
				case SPACE_TYPE:
					parent.append(new CSSWhitespace(css.slice(open, shut)))
					break
				// CSSString
				case STRING_TYPE:
					parent.append(new CSSString(css.slice(open + lead, shut - tail), css[open], tail))
					break
				// CSSHashIdentifier
				case HASH_TYPE:
					parent.append(new CSSHashIdentifier(css.slice(open + lead, shut)))
					break
				// CSSNumber
				case NUMBER_TYPE:
					parent.append(new CSSNumber(css.slice(open, shut - tail), css.slice(shut - tail, shut)))
					break
				// CSSAtIdentifier
				case AT_TYPE:
					parent.append(new CSSAtIdentifier(css.slice(open + lead, shut)))
					break
				// CSSFunction
				case FUNC_TYPE:
					parent.append(parent = new CSSFunction(css.slice(open, shut - tail), css[shut]))
					break
				// CSSNamedIdentifier
				case NAME_TYPE:
					parent.append(new CSSNamedIdentifier(css.slice(open, shut)))
					break
				// opening-round-bracket, (
				case L_RB:
				// opening-square-bracket, [
				case L_SB:
				// opening-curly-bracket, {
				case L_CB:
					// CSSBlock
					parent.append(parent = new CSSBlock(css[open], css[shut]))
					break
					// closing-round-bracket, )
				case R_RB:
					switch (parent.delimiterStart) {
						// CSSBlock
						case '(':
							parent.delimiterEnd = ')'
							parent = parent.parent
							break
						// CSSDelimiter
						default:
							parent.append(new CSSDelimiter(')'))
					}
					break
				// closing-square-bracket, ]
				case R_SB:
					switch (parent.delimiterStart) {
						// CSSBlock
						case '[':
							parent.delimiterEnd = ']'
							parent = parent.parent
							break
						// CSSDelimiter
						default:
							parent.append(new CSSDelimiter(']'))
					}
					break
				// closing-curly-bracket, }
				case R_CB:
					switch (parent.delimiterStart) {
						// CSSBlock
						case '{':
							parent.delimiterEnd = '}'
							parent = parent.parent
							break
						// CSSDelimiter
						default:
							parent.append(new CSSDelimiter('}'))
					}
					break
				// CSSDelimiter
				default:
					parent.append(new CSSDelimiter(css.slice(open, shut)))
			}
		})

		return root
	}
})(
	require('../../cssom'),
	require('../../tokenize')
)
