var CSSOM = require('../../cssom')
var tokenize = require('../../tokenize')

// var CSSBlock = CSSOM.CSSBlock
var CSSComment = CSSOM.CSSComment
var CSSWhitespace = CSSOM.CSSWhitespace
// var CSSString = CSSOM.CSSString
// var CSSHashIdentifier = CSSOM.CSSHashIdentifier
// var CSSNumber = CSSOM.CSSNumber
// var CSSAtIdentifier = CSSOM.CSSAtIdentifier
// var CSSFunction = CSSOM.CSSFunction
// var CSSNamedIdentifier = CSSOM.CSSNamedIdentifier
// var CSSDelimiter = CSSOM.CSSDelimiter

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

/**
* Reads CSS and parses it into an object model.
* @param {string} css - CSS being tokenized.
* @returns {CSSBlock} CSS Object Model.
*/
function parse(css, consumer) {
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

			// CSSAtRule
			case AT_TYPE:
				parent.append(parent = new CSSAtRule())
				break

			// CSSStyleRule
			default:
				parent.append(parent = new CSSStyleRule())
		}
	})

	return root
}

module.exports = parse
