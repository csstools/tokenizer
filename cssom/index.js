function CSSNode() {} CSSNode.prototype = Object.create(Object.prototype)

function CSSValue() {} CSSValue.prototype = Object.create(CSSNode.prototype)

function CSSComment(initValue) {


	this.value = initValue
	this.delimiterStart = '/*'
	this.delimiterEnd = arguments[1] === '' ? '' : '*/'
}
CSSComment.prototype = Object.create(CSSValue.prototype, {
	toJSON: { configurable: true, writable: true, value: function () {
		return {
			type: this.type,
			value: this.value,
			delimiterStart: this.delimiterStart,
			delimiterEnd: this.delimiterEnd
		}
	} },

	toString: { configurable: true, writable: true, value: function () {
		return this.delimiterStart + this.value + this.delimiterEnd
	} },

	type: { configurable: true, get: function () {
		return 'CSSComment'
	} }
})

function CSSWhitespace(initValue) {


	this.value = initValue
}
CSSWhitespace.prototype = Object.create(CSSValue.prototype, {
	toJSON: { configurable: true, writable: true, value: function () {
		return {
			type: this.type,
			value: this.value
		}
	} },

	toString: { configurable: true, writable: true, value: function () {
		return this.value
	} },

	type: { configurable: true, get: function () {
		return 'CSSWhitespace'
	} }
})

function CSSString(initValue) {


	this.value = initValue
	this.delimiterStart = arguments[1] || '"'
	this.delimiterEnd = arguments[2] === '' ? '' : this.delimiterStart
}
CSSString.prototype = Object.create(CSSValue.prototype, {
	toJSON: { configurable: true, writable: true, value: function () {
		return {
			type: this.type,
			value: this.value,
			delimiterStart: this.delimiterStart,
			delimiterEnd: this.delimiterEnd
		}
	} },

	toString: { configurable: true, writable: true, value: function () {
		return this.delimiterStart + this.value + this.delimiterEnd
	} },

	type: { configurable: true, get: function () {
		return 'CSSString'
	} }
})

function CSSAtIdentifier(initValue) {


	this.value = initValue
	this.delimiterStart = '@'
}
CSSAtIdentifier.prototype = Object.create(CSSValue.prototype, {
	toJSON: { configurable: true, writable: true, value: function () {
		return {
			type: this.type,
			value: this.value,
			delimiterStart: this.delimiterStart
		}
	} },

	toString: { configurable: true, writable: true, value: function () {
		return this.delimiterStart + this.value
	} },

	type: { configurable: true, get: function () {
		return 'CSSAtIdentifier'
	} }
})

function CSSHashIdentifier(initValue) {


	this.value = initValue
	this.delimiterStart = '#'
}
CSSHashIdentifier.prototype = Object.create(CSSValue.prototype, {
	toJSON: { configurable: true, writable: true, value: function () {
		return {
			type: this.type,
			value: this.value,
			delimiterStart: this.delimiterStart
		}
	} },

	toString: { configurable: true, writable: true, value: function () {
		return this.delimiterStart + this.value
	} },

	type: { configurable: true, get: function () {
		return 'CSSHashIdentifier'
	} }
})

function CSSNamedIdentifier(initValue) {


	this.value = initValue
}
CSSNamedIdentifier.prototype = Object.create(CSSValue.prototype, {
	toJSON: { configurable: true, writable: true, value: function () {
		return {
			type: this.type,
			value: this.value
		}
	} },

	toString: { configurable: true, writable: true, value: function () {
		return this.value
	} },

	type: { configurable: true, get: function () {
		return 'CSSNamedIdentifier'
	} }
})

function CSSNumber(initValue, initUnit) {


	this.value = initValue
	this.unit = initUnit
}
CSSNumber.prototype = Object.create(CSSValue.prototype, {
	toJSON: { configurable: true, writable: true, value: function () {
		return {
			type: this.type,
			value: this.value,
			unit: this.unit
		}
	} },

	toString: { configurable: true, writable: true, value: function () {
		return this.value + this.unit
	} },

	type: { configurable: true, get: function () {
		return 'CSSNumber'
	} }
})

function CSSDelimiter(initValue) {


	this.value = initValue
}
CSSDelimiter.prototype = Object.create(CSSValue.prototype, {
	toJSON: { configurable: true, writable: true, value: function () {
		return {
			type: this.type,
			value: this.value
		}
	} },

	toString: { configurable: true, writable: true, value: function () {
		return this.value
	} },

	type: { configurable: true, get: function () {
		return 'CSSDelimiter'
	} }
})

function CSSBlock() {


	this.nodes = []
	this.delimiterStart = arguments[0] == null ? '(' : arguments[0]
	this.delimiterEnd = arguments[1] == null ? ')' : arguments[1]
}
CSSBlock.prototype = Object.create(CSSValue.prototype, {
	append: { configurable: true, writable: true, value: function () {
		for (var node of Array.prototype.slice.call(arguments)) {
			if (node.parent) {
				node.parent.removeChild(node)
			}
			node.parent = this
			this.nodes.push(node)
		}
		return this
	} },

	removeChild: { configurable: true, writable: true, value: function () {
		var nodes = this.nodes
		var index = nodes.indexOf(node)
		if (index !== -1) {
			nodes.splice(index, 1)
			delete node.parent
		}
	} },

	toJSON: { configurable: true, writable: true, value: function () {
		return {
			type: this.type,
			nodes: this.nodes.map(node => node.toJSON()),
			delimiterStart: this.delimiterStart,
			delimiterEnd: this.delimiterEnd
		}
	} },

	toString: { configurable: true, writable: true, value: function () {
		return this.delimiterStart + this.nodes.join('') + this.delimiterEnd
	} },

	type: { configurable: true, get: function () {
		return 'CSSBlock'
	} }
})

function CSSFunction(initName) {

	CSSBlock.call(this, '(', arguments[1])
	this.name = initName
}
CSSFunction.prototype = Object.create(CSSBlock.prototype, {
	toJSON: { configurable: true, writable: true, value: function () {
		return {
			type: this.type,
			name: this.name,
			nodes: this.nodes.map(node => node.toJSON()),
			delimiterStart: this.delimiterStart,
			delimiterEnd: this.delimiterEnd
		}
	} },

	toString: { configurable: true, writable: true, value: function () {
		return this.name + this.delimiterStart + this.nodes.join('') + this.delimiterEnd
	} },

	type: { configurable: true, get: function () {
		return 'CSSFunction'
	} }
})

module.exports = {
	CSSNode: CSSNode,
	CSSValue: CSSValue,
	CSSComment: CSSComment,
	CSSWhitespace: CSSWhitespace,
	CSSString: CSSString,
	CSSAtIdentifier: CSSAtIdentifier,
	CSSHashIdentifier: CSSHashIdentifier,
	CSSNamedIdentifier: CSSNamedIdentifier,
	CSSNumber: CSSNumber,
	CSSDelimiter: CSSDelimiter,
	CSSBlock: CSSBlock,
	CSSFunction: CSSFunction
}
