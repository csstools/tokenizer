var CSSTokenizer = require('../tokenizer/index.js')

var AT   = 0x0040 // @
var L_RB = 0x0028 // (
var R_RB = 0x0029 // )
var L_SB = 0x005B // [
var R_SB = 0x005D // ]
var L_CB = 0x007B // {
var R_CB = 0x007D // }

var COMMENT_TOKEN = 0x0041 // A
var SPACE_TOKEN   = 0x0009 // ↹
var NUMBER_TOKEN  = 0x0039 // 9
var NAME_TOKEN    = 0x0045 // E
var HASH_TOKEN    = 0x005A // Z
var STRING_TOKEN  = 0x0022 // "

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
	constructor (value = '') {
		super()
		this.value = value
	}
	toJSON() {
		return {
			type: this.type,
			value: this.value,
			quote: this.quote
		}
	}
	toString() {
		return this.value
	}
}

class CSSAtIdentifier extends CSSValue {
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
		return '@' + this.value
	}
}

class CSSHashIdentifier extends CSSValue {
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
		return '#' + this.value
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
	constructor (name = '--', delimiterStart = '(', delimiterEnd = ')') {
		super(delimiterStart, delimiterEnd)
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

function parse(css) {
	var LastClass = CSSBlock
	var root = new LastClass('', '')
	var parent = root

	var lastType
	var lastValue

	CSSTokenizer(css, (type, value) => {
		switch (type) {
			// CSSComment
			case COMMENT_TOKEN:
				LastClass = CSSComment
				parent.append(new LastClass(value))
				break
			// CSSWhitespace
			case SPACE_TOKEN:
				LastClass = CSSWhitespace
				parent.append(new LastClass(value))
				break
			// CSSString
			case STRING_TOKEN:
				LastClass = CSSString
				parent.append(new LastClass(value))
				break
			// CSSHashIdentifier
			case HASH_TOKEN:
				LastClass = CSSHashIdentifier
				parent.append(new LastClass(value.slice(1)))
				break
			// CSSNumber
			case NUMBER_TOKEN:
				LastClass = CSSNumber
				parent.append(new LastClass(value, ''))
				break
			// CSSNamedIdentifier
			case NAME_TOKEN:
				switch (lastType) {
					case AT:
						LastClass = CSSAtIdentifier
						parent.nodes.pop()
						parent.append(new LastClass(value))
						break
					case NUMBER_TOKEN:
						parent.nodes.slice(-1).pop().unit = value
						break
					default:
						LastClass = CSSNamedIdentifier
						parent.append(new LastClass(value))
				}
				break
			// opening-round-bracket, (
			case L_RB:
				switch (LastClass) {
					// CSSFunction
					case CSSNamedIdentifier:
						LastClass = CSSFunction
						parent.nodes.pop()
						parent.append(parent = new LastClass(lastValue, value, ''))
						break
					// CSSBlock
					default:
						LastClass = CSSBlock
						parent.append(parent = new LastClass(value, ''))
				}
				break
			// closing-round-bracket, )
			case R_RB:
				switch (parent.delimiterStart) {
					// CSSBlock
					case '(':
						parent.delimiterEnd = value
						parent = parent.parent
						LastClass = CSSBlock
						break
					// CSSDelimiter
					default:
						LastClass = CSSDelimiter
						parent.append(new LastClass(value))
				}
				break
			// opening-square-bracket, [
			case L_SB:
			// opening-curly-bracket, {
			case L_CB:
				// CSSBlock
				LastClass = CSSBlock
				parent.append(parent = new LastClass(value, ''))
				break
			// closing-square-bracket, ]
			case R_SB:
				switch (parent.delimiterStart) {
					// CSSBlock
					case '[':
						parent.delimiterEnd = value
						parent = parent.parent
						LastClass = CSSBlock
						break
					// CSSDelimiter
					default:
						LastClass = CSSDelimiter
						parent.append(new LastClass(value))
				}
				break
			// closing-curly-bracket, }
			case R_CB:
				switch (parent.delimiterStart) {
					// CSSBlock
					case '{':
						parent.delimiterEnd = value
						parent = parent.parent
						LastClass = CSSBlock
						break
					// CSSDelimiter
					default:
						LastClass = CSSDelimiter
						parent.append(new LastClass(value))
				}
				break
			// CSSDelimiter
			default:
				LastClass = CSSDelimiter
				parent.append(new LastClass(value))
		}
		lastType = type
		lastValue = value
	})

	return root
}
