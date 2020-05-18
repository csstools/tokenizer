class CSSNode extends Object {}

class CSSValue extends CSSNode {
	after(...nodes) {
		var parent = this.parent
		if (parent) {
			var siblings = parent.nodes
			var index = siblings.indexOf(node)
			if (index !== -1) {
				siblings.splice(index + 1, 0, ...nodes.map(node => {
					var parent = node.parent
					if (parent) {
						var index = parent.nodes.indexOf(node)
						if (index !== -1) {
							
						}
					}
				}))
				node.parent = this
			}
		}
		return this
	}

	before(...nodes) {
		var parent = this.parent
		if (parent) {
			var siblings = parent.nodes
			var index = siblings.indexOf(node)
			if (index !== -1) {
				siblings.splice(index, 0, ...nodes)
				node.parent = this
			}
		}
		return this
	}

	remove() {
		return this.replaceWith()
	}

	replaceWith(...nodes) {
		var parent = this.parent
		if (parent) {
			var siblings = parent.nodes
			var index = siblings.indexOf(node)
			if (index !== -1) {
				siblings.splice(index, 1, ...nodes)
				delete this.parent
				node.parent = this
			}
		}
		return this
	}
}

class CSSComment extends CSSValue {
	constructor(initValue) {
		super()
		this.value = initValue
		this.delimiterStart = '/*'
		this.delimiterEnd = arguments[1] === '' ? '' : '*/'
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

	get type() {
		return 'CSSComment'
	}
}

class CSSWhitespace extends CSSValue {
	constructor(initValue) {
		super()
		this.value = initValue
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

	get type() {
		return 'CSSWhitespace'
	}
}

class CSSString extends CSSValue {
	constructor(initValue) {
		super()
		this.value = initValue
		this.delimiterStart = arguments[1] || '"'
		this.delimiterEnd = arguments[2] === '' ? '' : this.delimiterStart
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

	get type() {
		return 'CSSString'
	}
}

class CSSAtIdentifier extends CSSValue {
	constructor(initValue) {
		super()
		this.value = initValue
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

	get type() {
		return 'CSSAtIdentifier'
	}
}

class CSSHashIdentifier extends CSSValue {
	constructor(initValue) {
		super()
		this.value = initValue
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

	get type() {
		return 'CSSHashIdentifier'
	}
}

class CSSNamedIdentifier extends CSSValue {
	constructor(initValue) {
		super()
		this.value = initValue
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

	get type() {
		return 'CSSNamedIdentifier'
	}
}

class CSSNumber extends CSSValue {
	constructor(initValue, initUnit) {
		super()
		this.value = initValue
		this.unit = initUnit
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

	get type() {
		return 'CSSNumber'
	}
}

class CSSDelimiter extends CSSValue {
	constructor(initValue) {
		super()
		this.value = initValue
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

	get type() {
		return 'CSSDelimiter'
	}
}

class CSSBlock extends CSSValue {
	constructor() {
		super()
		this.nodes = []
		this.delimiterStart = arguments[0] == null ? '(' : arguments[0]
		this.delimiterEnd = arguments[1] == null ? ')' : arguments[0]
	}

	append(...nodes) {
		for (var node of nodes) {
			if (node.parent) {
				node.parent.removeChild(node)
			}
			node.parent = this
			this.nodes.push(node)
		}
		return this
	}

	removeChild(node) {
		var nodes = this.nodes
		var index = nodes.indexOf(node)
		if (index !== -1) {
			nodes.splice(index, 1)
			delete node.parent
		}
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

	get type() {
		return 'CSSBlock'
	}
}

class CSSFunction extends CSSBlock {
	constructor(initName) {
		super('(', arguments[1])
		this.name = initName
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

	get type() {
		return 'CSSFunction'
	}
}

module.exports = {
	CSSNode,
	CSSValue,
	CSSComment,
	CSSWhitespace,
	CSSString,
	CSSAtIdentifier,
	CSSHashIdentifier,
	CSSNamedIdentifier,
	CSSNumber,
	CSSDelimiter,
	CSSBlock,
	CSSFunction
}
