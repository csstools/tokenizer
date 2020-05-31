var fs = require('fs')
var tokenize = require('./tokenize-w-postcss')

var SPACE_TYPE    = 0x0009 // ␠ ===  32
var STRING_TYPE   = 0x0022 // " ===  34
var NUMBER_TYPE   = 0x0030 // 0 ===  48
var AT_TYPE       = 0x0041 // A ===  65
var COMMENT_TYPE  = 0x0043 // C ===  67
var FUNCTION_TYPE = 0x0046 // F ===  70
var HASH_TYPE     = 0x0048 // H ===  72
var NAME_TYPE     = 0x004E // N ===  78

var BANG = 0x0021 // !
var HASH = 0x0023 // #
var AMPR = 0x0026 // &
var STAR = 0x002A // *
var STOP = 0x002E // .
var COLN = 0x003A // :
var SEMI = 0x003B // ;

var L_RB = 0x0028 // (
var R_RB = 0x0029 // )
var L_SB = 0x005B // [
var R_SB = 0x005D // ]
var L_CB = 0x007B // {
var R_CB = 0x007D // }

var B_LR = Object.create(null) // { "(": ")", "[": "]", "{": "}" }

B_LR[L_RB] = R_RB
B_LR[L_SB] = R_SB
B_LR[L_CB] = R_CB

var string = fs.readFileSync('./tokenize/selectors.css', 'utf8')
var tokens = tokenize(string)

var cnodes = consumeSheet(tokens)

// console.log(cnodes)
console.log(JSON.stringify(cnodes, null, '  '))

function consumeSheet(tokens) {
	var nodes = []
	while (tokens.next()) {
		switch (tokens.type) {
			case SPACE_TYPE:
				nodes.push({
					type: 'CSSSpace',
					value: tokens.rootCSS()
				})
				break
			case COMMENT_TYPE:
				nodes.push({
					type: 'CSSComment',
					value: tokens.rootCSS(),
					delimiterStart: tokens.leadCSS(),
					delimiterEnd: tokens.tailCSS()
				})
				break
			default:
				nodes.push(consumeRule(tokens))
				break
		}
	}
	return nodes
}

function consumeRule(tokens) {
	var ruleNode = {
		type: tokens.type === AT_TYPE ? 'CSSAtRule' : 'CSSStyleRule',
		name: null,
		prelude: [],
		value: [],
		delimiterStart: '',
		delimiterEnd: ''
	}
	if (tokens.type === AT_TYPE) {
		ruleNode.name = consumeComponentValue(tokens)
		while (tokens.next()) {
			switch (tokens.type) {
				default:
					ruleNode.prelude.push(consumeComponentValue(tokens))
					continue
				case L_CB:
					var blockNode = consumeBlock(tokens, L_CB, consumeAtRuleValue)
					ruleNode.delimiterStart = blockNode.delimiterStart
					ruleNode.delimiterEnd = blockNode.delimiterEnd
					ruleNode.value = blockNode.value
			}
			break
		}
	} else {
		delete ruleNode.name
		tokens.deja()
		ruleNode.prelude = consumeSelectors(tokens)
		if (tokens.type === L_CB) {
			var blockNode = consumeBlock(tokens, L_CB, consumeRuleValue)
			ruleNode.delimiterStart = blockNode.delimiterStart
			ruleNode.delimiterEnd = blockNode.delimiterEnd
			ruleNode.value = blockNode.value
		}
	}

	return ruleNode
}

function consumeAtRuleValue(tokens) {
	switch (tokens.type) {
		case SPACE_TYPE:
			return {
				type: 'CSSSpace',
				value: tokens.rootCSS()
			}
		case COMMENT_TYPE:
			return {
				type: 'CSSComment',
				value: tokens.rootCSS(),
				delimiterStart: tokens.leadCSS(),
				delimiterEnd: tokens.tailCSS()
			}
		default:
			return consumeRule(tokens)
	}
}

function consumeRuleValue(tokens) {
	switch (tokens.type) {
		case NAME_TYPE:
			return consumeDeclaration(tokens)
		default:
			return consumeComponentValue(tokens)
	}
}

function consumeDeclaration(tokens) {
	var declaration = {
		type: 'CSSDeclaration',
		name: [],
		value: [],
		important: [],
		delimiterStart: '',
		delimiterEnd: ''
	}
	switch (tokens.type) {
		case NAME_TYPE:
			declaration.name.push(consumeComponentValue(tokens))
			while (tokens.next()) {
				switch(tokens.type) {
					case SPACE_TYPE:
					case COMMENT_TYPE:
						declaration.name.push(consumeComponentValue(tokens))
						continue
					case COLN:
						declaration.delimiterStart = String.fromCharCode(COLN)
						break
					default:
						tokens.deja()
						return declaration
				}
				break
			}
			var importantOpen = -1
			while (tokens.next()) {
				switch (tokens.type) {
					case SEMI:
						declaration.delimiterEnd = String.fromCharCode(SEMI)
						break
					case R_CB:
						tokens.deja()
						break
					case BANG:
						importantOpen = declaration.value.length
						declaration.value.push(consumeComponentValue(tokens))
						continue
					case NAME_TYPE:
						if (importantOpen === -1 || !/^important$/i.test(tokens.rootCSS())) importantOpen = -1
						declaration.value.push(consumeComponentValue(tokens))
						continue
					default:
						importantOpen = -1
					case COMMENT_TYPE:
					case SPACE_TYPE:
						declaration.value.push(consumeComponentValue(tokens))
						continue
				}
				break
			}
			if (importantOpen !== -1) declaration.important = declaration.value.splice(importantOpen)
			else delete declaration.important
			break
	}
	return declaration
}

function consumeComponentValue(tokens) {
	switch (tokens.type) {
		case SPACE_TYPE:
			return {
				type: 'CSSSpace',
				value: tokens.rootCSS()
			}
		case STRING_TYPE:
			return {
				type: 'CSSString',
				value: tokens.rootCSS(),
				delimiterStart: tokens.leadCSS(),
				delimiterEnd: tokens.tailCSS()
			}
		case NUMBER_TYPE:
			return {
				type: 'CSSNumber',
				value: tokens.rootCSS(),
				unit: tokens.tailCSS()
			}
		case COMMENT_TYPE:
			return {
				type: 'CSSComment',
				value: tokens.rootCSS(),
				delimiterStart: tokens.leadCSS(),
				delimiterEnd: tokens.tailCSS()
			}
		case NAME_TYPE:
			return {
				type: 'CSSWordIdentifier',
				value: tokens.rootCSS()
			}
		case HASH_TYPE:
			return {
				type: 'CSSHashIdentifier',
				value: tokens.rootCSS(),
				delimiterStart: tokens.leadCSS()
			}
		case FUNCTION_TYPE:
			return consumeBlock(tokens, L_RB, consumeComponentValue, tokens.rootCSS())
		case AT_TYPE:
			return {
				type: 'CSSAtIdentifier',
				value: tokens.rootCSS(),
				delimiterStart: tokens.leadCSS()
			}
		case L_RB:
		case L_SB:
		case L_CB:
			return consumeBlock(tokens, tokens.type, consumeComponentValue)
		default:
			return {
				type: 'CSSDelimiter',
				value: tokens.rootCSS()
			}
	}
}

function consumeBlock(tokens, openType, consume, name) {
	var blockNode = {
		type: name ? 'CSSFunction' : 'CSSBlock',
		name: name,
		value: [],
		delimiterStart: String.fromCharCode(openType),
		delimiterEnd: ''
	}
	var closeType = B_LR[openType]
	if (!name) delete blockNode.name
	while (tokens.next()) {
		switch (tokens.type) {
			case closeType:
				blockNode.delimiterEnd = String.fromCharCode(closeType)
				break
			default:
				blockNode.value.push(consume(tokens))
				continue
		}
		break
	}
	return blockNode
}

function consumeSelectors(tokens) {
	var nodes = []
	var stopOpen = -1
	var hashOpen = -1
	var colnOpen = -1
	while (tokens.next()) {
		switch (tokens.type) {
			case STOP:
				stopOpen = nodes.length
				hashOpen = -1
				colnOpen = -1
				nodes.push(consumeComponentValue(tokens))
				continue
			case HASH:
				hashOpen = nodes.length
				stopOpen = -1
				colnOpen = -1
				nodes.push(consumeComponentValue(tokens))
				continue
			case COLN:
				colnOpen = colnOpen === -1 ? nodes.length : colnOpen
				stopOpen = -1
				hashOpen = -1
				nodes.push(consumeComponentValue(tokens))
				continue
			case STAR:
				nodes.push({
					type: 'CSSUniversalSelector',
					value: tokens.rootCSS()
				})
				continue
			case NAME_TYPE:
				nodes.push({
					type: (
						stopOpen !== -1
							? 'CSSClassSelector'
						: hashOpen !== -1
							? 'CSSIdSelector'
						: colnOpen !== -1
							? 'CSSPseudoSelector'
						: 'CSSTypeSelector'
					),
					value: (
						stopOpen !== -1
							? nodes.splice(stopOpen)
						: hashOpen !== -1
							? nodes.splice(hashOpen)
						: colnOpen !== -1
							? nodes.splice(colnOpen)
						: []
					).concat(consumeComponentValue(tokens))
				})
				stopOpen = -1
				hashOpen = -1
				colnOpen = -1
				continue
			default:
				nodes.push(consumeComponentValue(tokens))
				continue
			case L_CB:
		}
		break
	}
	return nodes
}
