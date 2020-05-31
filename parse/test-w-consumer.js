let { readFileSync, writeFileSync } = require('fs')
let parse = require('./parse-w-consumer')
let bootstrapCSSPath = require.resolve('bootstrap/dist/css/bootstrap.css')
let bootstrapCSS = readFileSync(bootstrapCSSPath, 'utf8')
let tokenizeWithConsumer = require('../tokenize/tokenize-w-consumer')

var CSSRoot = CSSOM.CSSRoot
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

bootstrapCSS = `
button:not(:disabled),
[type="button"]:not(:disabled),
[type="reset"]:not(:disabled),
[type="submit"]:not(:disabled) {
  cursor: pointer;
}
`.trim()

let types = {
	0x0009: "    SPACE",
	0x0022: "   STRING",
	0x0030: "   NUMBER",
	0x0041: "  COMMENT",
	0x0045: "  NAME ID",
	0x005A: "  HASH ID",
	0x0065: " FUNCTION",
	0x007A: "       AT",
}

let dataText = ''

function parse(css) {
	tokenizeWithConsumer.call({}, bootstrapCSS, consumeSheet)

	function consumeSheet(type, open, shut, lead, tail, css) {
		switch (type) {
			default:

		}

		return consumeSheet
	}
}

// let root = parse(bootstrapCSS).toJSON().nodes

// console.log(root)

// writeFileSync('./cool.json', JSON.stringify(root, null, '  '))
