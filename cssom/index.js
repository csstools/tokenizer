/**
* Splices nodes from an array, removing and inserting new elements.
* @param {CSSNode[]} children - Array of CSS nodes being spliced.
* @param {number} start - Location in the CSS nodes array from which to start splicing.
* @param {number} deleteCount - Number of CSS nodes to remove.
* @param  {...CSSNode[]} nodes - CSS Nodes being spliced into the array.
*/
function childrenSplice(parent, children, start, deleteCount, nodes) {
	for (var i = 0; i < nodes.length; ++i) {
		remove.call(nodes[i]).parent = parent
	}
	splice.bind(children, start, deleteCount).apply(null, nodes)
}
var splice = Array.prototype.splice
/* CSSOM traversal and manipulation methods.
/* ========================================================================== */

function after() {
	var parent = this.parent
	if (parent) {
		var children = parent.nodes
		var childIndex = children.indexOf(this) + 1
		if (childIndex % children.length) childrenSplice(parent, children, childIndex, 0, arguments)
	}
	return this
}

function append() {
	var children = this.nodes
	childrenSplice(this, children, children.length, 0, arguments)
	return this
}

function before() {
	var parent = this.parent
	if (parent) {
		var children = parent.nodes
		var childIndex = children.indexOf(this) - 1
		if (childIndex >= 0) childrenSplice(parent, children, childIndex, 0, arguments)
	}
	return this
}

function indexOf(node, fromIndex) {
	var children = this.nodes
	return children.indexOf(node, fromIndex)
}

function insertAfter(child) {
	var children = this.nodes
	var childIndex = children.indexOf(child) + 1
	// inserts the nodes after the child or appends the nodes to the parent
	childrenSplice(this, children, childIndex % children.length ? childIndex : children.length - 1, 0, splice(arguments, 1))
	return this
}

function insertAt(position) {
	childrenSplice(this, this.nodes, position, 0, splice(arguments, 1))
	return this
}

function insertBefore(child) {
	var children = this.nodes
	var childIndex = children.indexOf(child) - 1
	// inserts the nodes before the child or appends the nodes to the parent
	childrenSplice(this, children, childIndex >= 0 ? childIndex : children.length - 1, 0, splice(arguments, 1))
	return this
}

function next() {
	var parent = this.parent
	if (parent) {
		var children = parent.nodes
		var childIndex = children.indexOf(child) + 1
		return childIndex % children.length ? children[childIndex] : null
	}
}

function prepend() {
	var children = this.nodes
	childrenSplice(this, children, 0, 0, arguments)
	return this
}

function previous() {
	var parent = this.parent
	if (parent) {
		var children = parent.nodes
		var childIndex = children.indexOf(this) - 1
		if (childIndex >= 0) return children[childIndex]
	}
	return null
}

function remove() {
	var parent = this.parent
	if (parent) {
		var children = parent.nodes
		var childIndex = children.indexOf(this)
		if (childIndex >= 0) childrenSplice(parent, children, childIndex, 1)
	}
	return this
}

function replaceChild(child) {
	var children = this.nodes
	var childIndex = children.indexOf(child)
	// replaces the child or appends the nodes
	childrenSplice(this, children, childIndex !== -1 ? children.length : childIndex, 1, splice(arguments, 1))
	return this
}

function replaceChildren() {
	var children = this.nodes
	var childrenLength = children.length
	childrenSplice(this, children, 0, childrenLength, arguments)
}

function replaceWith() {
	var parent = this.parent
	if (parent) {
		var children = parent.nodes
		var childIndex = children.indexOf(this)
		if (childIndex >= 0) childrenSplice(parent, children, childIndex, 1, arguments)
	}
	return this
}

/* CSSParentNode descriptors to be used as class mixins.
/* ========================================================================== */

var CSSParentNodeDescriptors = {
	append: { configurable: true, writable: true, value: append },
	indexOf: { configurable: true, writable: true, value: indexOf },
	insertAfter: { configurable: true, writable: true, value: insertAfter },
	insertAt: { configurable: true, writable: true, value: insertAt },
	insertBefore: { configurable: true, writable: true, value: insertBefore },
	prepend: { configurable: true, writable: true, value: prepend },
	replaceChild: { configurable: true, writable: true, value: replaceChild },
	replaceChildren: { configurable: true, writable: true, value: replaceChildren }
}

var CSSChildNodeDescriptors = {
	after: { configurable: true, writable: true, value: after },
	before: { configurable: true, writable: true, value: before },
	next: { configurable: true, writable: true, value: next },
	previous: { configurable: true, writable: true, value: previous },
	remove: { configurable: true, writable: true, value: remove },
	replaceWith: { configurable: true, writable: true, value: replaceWith }
}

/* CSSChildNode descriptors to be used as class mixins.
/* ========================================================================== */

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

Object.defineProperties(CSSComment.prototype, CSSChildNodeDescriptors)

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

Object.defineProperties(CSSWhitespace.prototype, CSSChildNodeDescriptors)

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

Object.defineProperties(CSSString.prototype, CSSChildNodeDescriptors)

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

Object.defineProperties(CSSAtIdentifier.prototype, CSSChildNodeDescriptors)

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

Object.defineProperties(CSSHashIdentifier.prototype, CSSChildNodeDescriptors)

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

Object.defineProperties(CSSNamedIdentifier.prototype, CSSChildNodeDescriptors)

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

Object.defineProperties(CSSNumber.prototype, CSSChildNodeDescriptors)

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

Object.defineProperties(CSSDelimiter.prototype, CSSChildNodeDescriptors)

function CSSBlock() {


	this.nodes = []
	this.delimiterStart = arguments[0] == null ? '(' : arguments[0]
	this.delimiterEnd = arguments[1] == null ? ')' : arguments[1]
}
CSSBlock.prototype = Object.create(CSSValue.prototype, {
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

Object.defineProperties(CSSBlock.prototype, CSSParentNodeDescriptors)
Object.defineProperties(CSSBlock.prototype, CSSChildNodeDescriptors)

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
