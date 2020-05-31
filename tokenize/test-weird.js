var tokenize = require('./tokenize-w-postcss')

var SPACE_TYPE    = 0x0009 // ␠ ===  32
var STRING_TYPE   = 0x0022 // " ===  34
var NUMBER_TYPE   = 0x0030 // 0 ===  48
var AT_TYPE       = 0x0041 // A ===  65
var COMMENT_TYPE  = 0x0043 // C ===  67
var FUNCTION_TYPE = 0x0046 // F ===  70
var HASH_TYPE     = 0x0048 // H ===  72
var NAME_TYPE     = 0x004E // N ===  78

var types = Object.create(null)
types[SPACE_TYPE] = 'Space'
types[STRING_TYPE] = 'String'
types[NUMBER_TYPE] = 'Number'
types[AT_TYPE] = 'AtIdentifier'
types[COMMENT_TYPE] = 'Comment'
types[FUNCTION_TYPE] = 'Function'
types[HASH_TYPE] = 'HashIdentifier'
types[NAME_TYPE] = 'WordIdentifier'

var tokens = tokenize(`--custprop: , leading, comma, value;`)

var build = []

while (tokens.next()) build.push(
	`${types[tokens.type] || 'Delimiter'}: ${JSON.stringify([tokens.leadCSS(), tokens.rootCSS(), tokens.tailCSS()].filter(Boolean)).slice(1, -1)}`
)

console.log(build.join('\n'))

// while (tokens.next()) console.log({ type: types[tokens.type] || 'Delimiter', lead: tokens.leadCSS(), root: tokens.rootCSS(), tail: tokens.tailCSS() })
