var CSSOM = require('../cssom')
var tokenize = require('../tokenize/tokenize-w-consumer')

var CSSComment = CSSOM.CSSComment
var CSSWhitespace = CSSOM.CSSWhitespace

var CSSAtIdentifier = CSSOM.CSSAtIdentifier
var CSSDelimiter = CSSOM.CSSDelimiter
var CSSHashIdentifier = CSSOM.CSSHashIdentifier
var CSSNamedIdentifier = CSSOM.CSSNamedIdentifier
var CSSNumber = CSSOM.CSSNumber
var CSSString = CSSOM.CSSString

var CSSBlock = CSSOM.CSSBlock
var CSSFunction = CSSOM.CSSFunction

var CSSAtRule = CSSOM.CSSAtRule
var CSSStyleRule = CSSOM.CSSStyleRule

var L_RB = 0x0028 // (
var R_RB = 0x0029 // )
var L_SB = 0x005B // [
var R_SB = 0x005D // ]
var L_CB = 0x007B // {
var R_CB = 0x007D // }

var SPACE_TYPE   = 0x0009 // ↹ ===   9
var STRING_TYPE  = 0x0022 // " ===  34
var NUMBER_TYPE  = 0x0030 // 0 ===  48
var COMMENT_TYPE = 0x0041 // A ===  65
var NAME_TYPE    = 0x0045 // E ===  69
var HASH_TYPE    = 0x005A // Z ===  90
var FUNC_TYPE    = 0x0065 // e === 101
var AT_TYPE      = 0x007A // z === 122

module.exports = parse

/**
* Reads CSS and parses it into an object model.
* @param {string} css - CSS being tokenized.
* @returns {CSSBlock} CSS Object Model.
*/
function parse(css) {
	var root = new CSSBlock('', '')
	var instance = {
		root: root,
		rootConsumer: consumeSheet,
		target: root,
		consumers: []
	}
	tokenize.call(instance, css, consumeSheet)
	return root
}

function consumeSheet(type, open, shut, lead, tail, css) {
	switch (type) {
		// CSSComment
		case COMMENT_TYPE:
			this.target.append(new CSSComment(css.slice(open + lead, shut - tail), tail ? '*/' : ''))
			break

		// CSSWhitespace
		case SPACE_TYPE:
			this.target.append(new CSSWhitespace(css.slice(open, shut)))
			break

		// CSSAtRule
		case AT_TYPE:
			this.consumers.push(consumeSheet, consumeSheet)
			this.target.append(this.target = new CSSAtRule())
			return consumePrelude.apply(this, arguments)

		// closing curly-bracket, }
		case R_CB:
			if (this.target.delimiterStart === '{') {
				this.target.delimiterEnd = '}'
				this.target = this.target.parent || this.root
				return (this.consumers.pop() || this.rootConsumer)
			}

		// CSSStyleRule
		default:
			this.consumers.push(consumeSheet, consumeValue)
			this.target.append(this.target = new CSSStyleRule())
			return consumePrelude.apply(this, arguments)
	}

	return consumeSheet
}

function consumePrelude(type, open, shut, lead, tail, css) {
	switch (type) {
		// CSSComment
		case COMMENT_TYPE:
			this.target.preludeAppend(new CSSComment(css.slice(open + lead, shut - tail), tail ? '*/' : ''))
			break

		// CSSWhitespace
		case SPACE_TYPE:
			this.target.preludeAppend(new CSSWhitespace(css.slice(open, shut)))
			break

		// CSSString
		case STRING_TYPE:
			this.target.preludeAppend(new CSSString(css.slice(open + lead, shut - tail), css[open], tail))
			break

		// CSSHashIdentifier
		case HASH_TYPE:
			this.target.preludeAppend(new CSSHashIdentifier(css.slice(open + lead, shut)))
			break

		// CSSNumber
		case NUMBER_TYPE:
			this.target.preludeAppend(new CSSNumber(css.slice(open, shut - tail), css.slice(shut - tail, shut)))
			break

		// CSSAtIdentifier
		case AT_TYPE:
			this.target.preludeAppend(new CSSAtIdentifier(css.slice(open + lead, shut)))
			break

		// CSSFunction
		case FUNC_TYPE:
			this.target.preludeAppend(this.target = new CSSFunction(css.slice(open, shut - tail), css[shut]))
			break

		// CSSNamedIdentifier
		case NAME_TYPE:
			this.target.preludeAppend(new CSSNamedIdentifier(css.slice(open, shut)))
			break

		// opening round bracket, (
		case L_RB:
		// opening square bracket, [
		case L_SB:
			// CSSBlock
			this.consumers.push(consumePrelude)
			this.target.append(this.target = new CSSBlock(css[open], css[shut]))
			return consumeValue

		// opening curly bracket === {
		case L_CB:
			this.target.delimiterStart = '{'
			return (this.consumers.pop() || this.rootConsumer)

		// closing round bracket, )
		case R_RB:
			switch (this.target.delimiterStart) {
				// CSSBlock
				case '(':
					this.target.delimiterEnd = ')'
					this.target = this.target.parent
					break

				// CSSDelimiter
				default:
					this.target.preludeAppend(new CSSDelimiter(')'))
			}
			break

		// closing square bracket, ]
		case R_SB:
			switch (this.target.delimiterStart) {
				// CSSBlock
				case '[':
					this.target.delimiterEnd = ']'
					this.target = this.target.parent
					break

				// CSSDelimiter
				default:
					this.target.preludeAppend(new CSSDelimiter(']'))
			}
			break

		// closing curly-bracket, }
		case R_CB:
			switch (this.target.delimiterStart) {
				// CSSBlock
				case '{':
					this.target.delimiterEnd = '}'
					this.target = this.target.parent || this.root
					return (this.consumers.pop() || this.rootConsumer)

				// CSSDelimiter
				default:
					this.target.preludeAppend(new CSSDelimiter('}'))
			}
			break

		// CSSDelimiter
		default:
			try {
				this.target.preludeAppend(new CSSDelimiter(css.slice(open, shut)))
			} catch (error) {
				console.log([this.target.parent.toString()])
				console.log([this.target.toString()])
				throw error
			}
	}

	return consumePrelude
}

function consumeValue(type, open, shut, lead, tail, css) {
	switch (type) {
		// CSSComment
		case COMMENT_TYPE:
			this.target.append(new CSSComment(css.slice(open + lead, shut - tail), tail ? '*/' : ''))
			break

		// CSSWhitespace
		case SPACE_TYPE:
			this.target.append(new CSSWhitespace(css.slice(open, shut)))
			break

		// CSSString
		case STRING_TYPE:
			this.target.append(new CSSString(css.slice(open + lead, shut - tail), css[open], tail))
			break

		// CSSHashIdentifier
		case HASH_TYPE:
			this.target.append(new CSSHashIdentifier(css.slice(open + lead, shut)))
			break

		// CSSNumber
		case NUMBER_TYPE:
			this.target.append(new CSSNumber(css.slice(open, shut - tail), css.slice(shut - tail, shut)))
			break

		// CSSAtIdentifier
		case AT_TYPE:
			this.target.append(new CSSAtIdentifier(css.slice(open + lead, shut)))
			break

		// CSSFunction
		case FUNC_TYPE:
			this.target.append(this.target = new CSSFunction(css.slice(open, shut - tail), css[shut]))
			break

		// CSSNamedIdentifier
		case NAME_TYPE:
			this.target.append(new CSSNamedIdentifier(css.slice(open, shut)))
			break

		// opening round bracket, (
		case L_RB:
		// opening square bracket, [
		case L_SB:
		// opening curly-bracket, {
		case L_CB:
			// CSSBlock
			this.target.append(this.target = new CSSBlock(css[open], css[shut]))
			break

		// closing round bracket, )
		case R_RB:
			switch (this.target.delimiterStart) {
				// CSSBlock
				case '(':
					this.target.delimiterEnd = ')'
					this.target = this.target.parent
					break

				// CSSDelimiter
				default:
					this.target.append(new CSSDelimiter(')'))
			}
			break

		// closing square bracket, ]
		case R_SB:
			switch (this.target.delimiterStart) {
				// CSSBlock
				case '[':
					this.target.delimiterEnd = ']'
					this.target = this.target.parent
					break

				// CSSDelimiter
				default:
					this.target.append(new CSSDelimiter(']'))
			}
			break

		// closing curly-bracket, }
		case R_CB:
			switch (this.target.delimiterStart) {
				// CSSBlock
				case '{':
					this.target.delimiterEnd = '}'
					this.target = this.target.parent || this.root
					return this.consumers.pop() || this.rootConsumer

				// CSSDelimiter
				default:
					this.target.append(new CSSDelimiter('}'))
			}
			break

		// CSSDelimiter
		default:
			this.target.append(new CSSDelimiter(css.slice(open, shut)))
	}

	return consumeValue
}
