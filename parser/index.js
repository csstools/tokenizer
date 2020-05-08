const tokenizer = require('../tokenizer/index.js')

module.exports = parse

class CSSNode {}

class CSSValue extends CSSNode {
	constructor () {
		super()
		this.type = 'CSSValue'
		this.parent = null
	}
}

class CSSComment extends CSSValue {
	constructor (value) {
		super()
		this.type = 'CSSComment'
		this.value = value
	}
	toString() {
		return this.value
	}
}

class CSSWhitespace extends CSSValue {
	constructor (value) {
		super()
		this.type = 'CSSWhitespace'
		this.value = value
	}
	toString() {
		return this.value
	}
}

class CSSString extends CSSValue {
	constructor (value) {
		super()
		this.type = 'CSSString'
		this.value = value
	}
	toString() {
		return this.value
	}
}

class CSSAtIdentifier extends CSSValue {
	constructor (value) {
		super()
		this.type = 'CSSAtIdentifer'
		this.value = value
	}
	toString() {
		return '@' + this.value
	}
}

class CSSHashIdentifier extends CSSValue {
	constructor (value) {
		super()
		this.type = 'CSSHashIdentifier'
		this.value = value
	}
	toString() {
		return '#' + this.value
	}
}

class CSSNameIdentifier extends CSSValue {
	constructor (value) {
		super()
		this.type = 'CSSNameIdentifier'
		this.value = value
	}
	toString() {
		return this.value
	}
}

class CSSNumber extends CSSValue {
	constructor (value, unit) {
		super()
		this.type = 'CSSNumber'
		this.value = value
		this.unit = unit
	}
	toString() {
		return this.value + this.unit
	}
}

class CSSDelimiter extends CSSValue {
	constructor (value) {
		super()
		this.type = 'CSSDelimiter'
		this.value = value
	}
	toString() {
		return this.value
	}
}

class CSSBlock extends CSSValue {
	constructor (delimiterStart = '(', delimiterEnd = ')') {
		super()
		this.type = 'CSSBlock'
		this.nodes = []
		this.delimiterStart = delimiterStart
		this.delimiterEnd = delimiterEnd
	}
	append(...nodes) {
		for (const node of nodes) {
			node.parent = this
			this.nodes.push(node)
		}
		return this
	}
	toString() {
		return this.delimiterStart + this.nodes.join('') + this.delimiterEnd
	}
}

class CSSFunction extends CSSBlock {
	constructor (name = '--', delimiterStart = '(', delimiterEnd = ')') {
		super(delimiterStart, delimiterEnd)
		this.type = 'CSSFunction'
		this.name = name
	}
	toString() {
		return this.name + this.delimiterStart + this.nodes.join('') + this.delimiterEnd
	}
}

function parse(css) {
	let root = new CSSBlock('', '')
	let parent = root
	let last

	tokenizer(css, (type, value) => {
		switch (type) {
			case 'comment':
				parent.append(last = new CSSComment(value))
				break
			case 'whitespace':
				parent.append(last = new CSSWhitespace(value))
				break
			case 'string':
				parent.append(last = new CSSString(value))
				break
			case 'identifier:at':
				parent.append(last = new CSSAtIdentifier(value.slice(1)))
				break
			case 'identifier:hash':
				parent.append(last = new CSSHashIdentifier(value.slice(1)))
				break
			case 'number':
				parent.append(last = new CSSNumber(value, ''))
				break
			case 'identifier:named':
				if (last instanceof CSSNumber) {
					last.unit = value
				} else {
					parent.append(last = new CSSNameIdentifier(value))
				}
				break
			default:
				switch (value) {
					case '(':
						if (last instanceof CSSNameIdentifier) {
							parent.nodes.pop()
							parent.append(parent = last = new CSSFunction(last.value, value))
						} else {
							parent.append(parent = last = new CSSBlock(value, ''))
						}
						break
					case ')':
						if (parent.delimiterStart === '(') {
							parent.delimiterEnd = value
							last = parent
							parent = parent.parent
						} else {
							parent.append(last = new CSSDelimiter(value))
						}
						break
					case '[':
					case '{':
						parent.append(parent = last = new CSSBlock(value, ''))
						break
					case ']':
						if (parent.delimiterStart === '[') {
							parent.delimiterEnd = value
							last = parent
							parent = parent.parent
						} else {
							parent.append(last = new CSSDelimiter(value))
						}
						break
					case '}':
						if (parent.delimiterStart === '{') {
							parent.delimiterEnd = value
							last = parent
							parent = parent.parent
						} else {
							parent.append(last = new CSSDelimiter(value))
						}
						break
					default:
						parent.append(last = new CSSDelimiter(value))
						break
				}
				break
		}
	})

	return root
}
