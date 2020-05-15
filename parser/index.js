var CSSTokenizer = require('../tokenizer/index.js')

var AT   = 0x0040 // @
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

module.exports = parse

class CSSNode {}

class CSSValue extends CSSNode {
	constructor () {
		super()
		this.parent = null
	}

	get type() {
		return Object.getPrototypeOf(this).constructor.name
	}
	toJSON() {
		return {
			type: this.type
		}
	}
}

class CSSComment extends CSSValue {
	constructor (value, isUnclosed) {
		super()
		this.value = value
		this.delimiterStart = '/*'
		this.delimiterEnd = isUnclosed ? '' : '*/'
	}
	toJSON() {
		return {
			type: this.type,
			value: this.value,
			delimiterStart: this.delimiterStart,
			delimiterEnd: this.delimiterEnd
		}
	}
	toString() {
		return this.delimiterStart + this.value + this.delimiterEnd
	}
}

class CSSWhitespace extends CSSValue {
	constructor (value) {
		super()
		this.value = value
	}
	toJSON() {
		return {
			type: this.type,
			value: this.value
		}
	}
	toString() {
		return this.value
	}
}

class CSSString extends CSSValue {
	constructor (value = '', delimiterStart = '"', delimiterEnd = '"') {
		super()
		this.value = value
		this.delimiterStart = delimiterStart
		this.delimiterEnd = delimiterEnd
	}
	toJSON() {
		return {
			type: this.type,
			value: this.value,
			delimiterStart: this.delimiterStart,
			delimiterEnd: this.delimiterEnd
		}
	}
	toString() {
		return this.delimiterStart + this.value + this.delimiterEnd
	}
}

class CSSAtIdentifier extends CSSValue {
	constructor (value = '--') {
		super()
		this.value = value
		this.delimiterStart = '@'
	}
	toJSON() {
		return {
			type: this.type,
			value: this.value,
			delimiterStart: this.delimiterStart
		}
	}
	toString() {
		return this.delimiterStart + this.value
	}
}

class CSSHashIdentifier extends CSSValue {
	constructor (value = '--') {
		super()
		this.value = value
		this.delimiterStart = '#'
	}
	toJSON() {
		return {
			type: this.type,
			value: this.value,
			delimiterStart: this.delimiterStart
		}
	}
	toString() {
		return this.delimiterStart + this.value
	}
}

class CSSNamedIdentifier extends CSSValue {
	constructor (value = '--') {
		super()
		this.value = value
	}
	toJSON() {
		return {
			type: this.type,
			value: this.value
		}
	}
	toString() {
		return this.value
	}
}

class CSSNumber extends CSSValue {
	constructor (value = '0', unit = '') {
		super()
		this.value = value
		this.unit = unit
	}
	toJSON() {
		return {
			type: this.type,
			value: this.value,
			unit: this.unit
		}
	}
	toString() {
		return this.value + this.unit
	}
}

class CSSDelimiter extends CSSValue {
	constructor (value = '!') {
		super()
		this.value = value
	}
	toJSON() {
		return {
			type: this.type,
			value: this.value
		}
	}
	toString() {
		return this.value
	}
}

class CSSBlock extends CSSValue {
	constructor (delimiterStart = '(', delimiterEnd = ')') {
		super()
		this.nodes = []
		this.delimiterStart = delimiterStart
		this.delimiterEnd = delimiterEnd
	}
	append(...nodes) {
		for (var node of nodes) {
			node.parent = this
			this.nodes.push(node)
		}
		return this
	}
	toJSON() {
		return {
			type: this.type,
			nodes: this.nodes.map(node => node.toJSON()),
			delimiterStart: this.delimiterStart,
			delimiterEnd: this.delimiterEnd
		}
	}
	toString() {
		return this.delimiterStart + this.nodes.join('') + this.delimiterEnd
	}
}

class CSSFunction extends CSSBlock {
	constructor (name = '--', isUnclosed = false) {
		super('(', isUnclosed ? '' : ')')
		this.name = name
	}
	toJSON() {
		return {
			type: this.type,
			name: this.name,
			nodes: this.nodes.map(node => node.toJSON()),
			delimiterStart: this.delimiterStart,
			delimiterEnd: this.delimiterEnd
		}
	}
	toString() {
		return this.name + this.delimiterStart + this.nodes.join('') + this.delimiterEnd
	}
}

/**
* Reads CSS and parses it into an object model.
* @param {string} css - CSS being tokenized.
* @returns {CSSBlock} CSS Object Model.
*/
function parse(css) {
	var root = new CSSBlock('', '')
	var parent = root

	CSSTokenizer(css, (type, open, shut, lead, tail) => {
		switch (type) {
			// CSSComment
			case COMMENT_TYPE:
				parent.append(new CSSComment(css.slice(open + lead, shut - tail), tail))
				break
			// CSSWhitespace
			case SPACE_TYPE:
				parent.append(new CSSWhitespace(css.slice(open, shut)))
				break
			// CSSString
			case STRING_TYPE:
				parent.append(new CSSString(css.slice(open + lead, shut - tail), css[open]))
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
				parent.append(parent = new CSSFunction(css.slice(open, shut - tail), true))
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
				parent.append(parent = new CSSBlock(css.slice(open, shut), ''))
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
