/**
* Splices nodes from an array, removing and inserting new elements.
* @param {CSSNode[]} children - Array of CSS nodes being spliced.
* @param {number} start - Location in the CSS nodes array from which to start splicing.
* @param {number} deleteCount - Number of CSS nodes to remove.
* @param  {...CSSNode[]} nodes - CSS Nodes being spliced into the array.
*/
function childrenSplice(parent, children, start, deleteCount, ...nodes) {
	for (var nodes of nodes) {
		remove.call(node).parent = parent
	}
	children.splice(start, deleteCount, ...nodes)
}

/* CSSOM traversal and manipulation methods.
/* ========================================================================== */

function after(...nodes) {
	var parent = this.parent
	if (parent) {
		var children = parent.nodes
		var childIndex = children.indexOf(this) + 1
		if (childIndex % children.length) childrenSplice(parent, children, childIndex, 0, ...nodes)
	}
	return this
}

function append(...nodes) {
	var children = this.nodes
	childrenSplice(this, children, children.length, 0, ...nodes)
	return this
}

function before(...nodes) {
	var parent = this.parent
	if (parent) {
		var children = parent.nodes
		var childIndex = children.indexOf(this) - 1
		if (childIndex >= 0) childrenSplice(parent, children, childIndex, 0, ...nodes)
	}
	return this
}

function indexOf(node, fromIndex) {
	var children = this.nodes
	return children.indexOf(node, fromIndex)
}

function insertAfter(child, ...nodes) {
	var children = this.nodes
	var childIndex = children.indexOf(child) + 1
	// inserts the this after the child or appends the nodes to the parent
	childrenSplice(this, children, childIndex % children.length ? childIndex : children.length - 1, 0, ...nodes)
	return this
}

function insertAt(position, ...nodes) {
	childrenSplice(this, this.nodes, position, 0, ...nodes)
	return this
}

function insertBefore(child, ...nodes) {
	var children = this.nodes
	var childIndex = children.indexOf(child) - 1
	// inserts the nodes before the child or appends the nodes to the parent
	childrenSplice(this, children, childIndex >= 0 ? childIndex : children.length - 1, 0, ...nodes)
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

function prepend(nodes) {
	var children = this.nodes
	childrenSplice(this, children, 0, 0, ...nodes)
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

function replaceChild(child, ...nodes) {
	var children = this.nodes
	var childIndex = children.indexOf(child)
	// replaces the child or appends the nodes
	childrenSplice(this, children, childIndex !== -1 ? children.length : childIndex, 1, ...nodes)
	return this
}

function replaceChildren(...nodes) {
	var children = this.nodes
	var childrenLength = children.length
	childrenSplice(this, children, 0, childrenLength, ...nodes)
}

function replaceWith(...nodes) {
	var parent = this.parent
	if (parent) {
		var children = parent.nodes
		var childIndex = children.indexOf(this)
		if (childIndex >= 0) childrenSplice(parent, children, childIndex, 1, ...nodes)
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

class CSSNode extends Object {}

class CSSValue extends CSSNode {}

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

Object.defineProperties(CSSComment.prototype, CSSChildNodeDescriptors)

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

Object.defineProperties(CSSWhitespace.prototype, CSSChildNodeDescriptors)

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

Object.defineProperties(CSSString.prototype, CSSChildNodeDescriptors)

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

Object.defineProperties(CSSAtIdentifier.prototype, CSSChildNodeDescriptors)

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

Object.defineProperties(CSSHashIdentifier.prototype, CSSChildNodeDescriptors)

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

Object.defineProperties(CSSNamedIdentifier.prototype, CSSChildNodeDescriptors)

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

Object.defineProperties(CSSNumber.prototype, CSSChildNodeDescriptors)

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

Object.defineProperties(CSSDelimiter.prototype, CSSChildNodeDescriptors)

class CSSBlock extends CSSValue {
	constructor() {
		super()
		this.nodes = []
		this.delimiterStart = arguments[0] == null ? '(' : arguments[0]
		this.delimiterEnd = arguments[1] == null ? ')' : arguments[0]
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

Object.defineProperties(CSSBlock.prototype, CSSParentNodeDescriptors)
Object.defineProperties(CSSBlock.prototype, CSSChildNodeDescriptors)

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
