var tokenize = require('../tokenize/tokenize-w-consumer')

var assign = Object.assign || function assign(target, source, name) { for (name in source) target[name] = source[name] }
var create = Object.create

var CSSOM = require('../cssom')

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
var CSSRoot = CSSOM.CSSRoot

// var CSSAtRule = CSSOM.CSSAtRule
// var CSSStyleRule = CSSOM.CSSStyleRule

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

var mirrors = {
	0x0028: 0x0029, // opening round bracket === (
	0x0029: 0x0028, // closing round bracket === )
	0x005B: 0x005D, // opening square bracket === [
	0x005D: 0x005B, // closing square bracket === ]
	0x007B: 0x007D, // opening curly bracket === {
	0x007D: 0x007B, // closing curly bracket === }
}

module.exports = parse

/**
* Reads CSS and parses it into an object model.
* @param {string} css - CSS being tokenized.
* @returns {CSSBlock} CSS Object Model.
*/
function parse(css) {
	var rootNode = new CSSRoot('', '')
	var instance = {
		rootNode: rootNode,
		currentNode: rootNode,
		currentCSS: css,
		currentConsumer: consumeSheet,
		consumers: [],
		rootConsumer: consumeSheet
	}
	tokenize.call(instance, css, consumeSheet)
	return rootNode
}

function consumeSheet(type, open, shut, lead, tail) {
	switch (type) {
		case COMMENT_TYPE:
		case SPACE_TYPE:
			return consumeComponentValue.apply(this, arguments)
		default:
			this.consumers.push(consumeSheet)
			this.currentConsumer = consumeRule
			return consumeRule.apply(this, arguments)
	}
}

function consumeRule(type, open, shut, lead, tail) {
	switch (type) {
		// opening curly bracket, {
		case L_CB:
			console.log('ready')
			process.exit(0)
		// Function
		case FUNC_TYPE:
		default:
			consumeComponentValue.apply(this, arguments)
	}

	return consumeRule
}

function consumeComponentValue(type, open, shut, lead, tail) {
	var currentCSS = this.currentCSS
	var currentNode = this.currentNode
	var siblingNode = currentNode.nodes
	var createdNode
	var cssLeads = currentCSS.slice(open, open + lead)
	var cssValue = currentCSS.slice(open + lead, shut - tail)
	var cssTails = currentCSS.slice(shut - tail, shut)

	switch (type) {
		// Comment
		case COMMENT_TYPE:
			append(CSSComment, {
				value: cssValue,
				delimiterStart: cssLeads,
				delimiterEnd: cssTails
			})
			break

		// Whitespace
		case SPACE_TYPE:
			append(CSSWhitespace, {
				value: cssValue
			})
			break

		// String
		case STRING_TYPE:
			append(CSSString, {
				value: cssValue,
				delimiterStart: cssLeads,
				delimiterEnd: cssTails
			})
			break

		// Number
		case NUMBER_TYPE:
			append(CSSNumber, {
				value: cssValue,
				unit: cssTails
			})
			break

		// Hash Identifier
		case HASH_TYPE:
			append(CSSHashIdentifier, {
				value: cssValue,
				delimiterStart: cssLeads
			})
			break

		// At Identifier
		case AT_TYPE:
			append(CSSAtIdentifier, {
				value: cssValue,
				delimiterStart: cssLeads
			})
			break

		// Function
		case FUNC_TYPE:
			append(CSSFunction, {
				name: cssValue,
				nodes: [],
				delimiterStart: cssTails,
				delimiterEnd: ''
			})
			this.currentNode = createdNode
			break

		// Named Identifier
		case NAME_TYPE:
			append(CSSNamedIdentifier, {
				value: cssValue
			})
			break

		// opening round bracket, (
		case L_RB:
		// opening square bracket, [
		case L_SB:
		// opening curly bracket, [
		case L_CB:
			append(CSSBlock, {
				nodes: [],
				delimiterStart: cssValue,
				delimiterEnd: ''
			})
			this.currentNode = createdNode
			this.consumers.push(this.currentConsumer)
			this.currentConsumer = consumeComponentValue
			break

		// closing round bracket, )
		case R_RB:
		// closing square bracket, ]
		case R_SB:
		// closing curly bracket, }
		case R_CB:
			if (currentNode.parent && currentNode.delimiterStart.charCodeAt(0) === mirrors[type]) {
				currentNode.delimiterEnd = cssValue
				this.currentNode = currentNode.parent
				return this.consumers.pop() || this.rootConsumer
			}

		// Delimiter
		default:
			append(CSSDelimiter, {
				value: cssValue
			})
	}

	return this.currentConsumer

	function append(Class, params) {
		createdNode = assign(create(Class.prototype), params)
		createdNode.parent = currentNode
		siblingNode.push(createdNode)
	}
}
