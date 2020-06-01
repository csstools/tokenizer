let { readFileSync, writeFileSync } = require('fs')
let vlq = require('vlq')
let tokenize = require('../tokenize')

let fileName = 'test.css'
let fileData = readFileSync('tokenize/test.css', 'utf8')

let mapping = []
let mappings = [mapping]
let previousLine = 0
let previousColumn = 0

tokenize(fileData, (type, sourceLine, sourceColumn) => {
	/** @type {number} Opening line of the current token; relative to the previous line mapping. */
	let line = sourceLine - previousLine

	/** @type {number} Opening column of the current token; relative to the previous column mapping. */
	let column = sourceColumn - previousColumn

	/** @type {number} Opening column of the mapped token; absolute when changing lines and otherwise relative. */
	let mappedColumn = line ? sourceColumn : sourceColumn - previousColumn

	/** @type {number} Index of the source. */
	let sourceIndex = 0

	for (let i = 0; i < line; ++i) mappings.push(mapping = [])

	mapping.push([mappedColumn, sourceIndex, line, column])

	previousLine = sourceLine
	previousColumn = sourceColumn
})

let distName = '/Users/jonathan/GitHub/sokra/source-map-visualization/example/sass/example.map'
let distData = JSON.stringify(
	{
		version: 3,
		file: `${fileName}.map`,
		sources: [fileName],
		sourcesContent: [fileData],
		mappings: mappings.map(
			line => line.map(segment => vlq.encode(segment)).join(',')
		).join(';')
	},
	null,
	'  '
)

writeFileSync(distName, distData)

// console.log(
// 	JSON.stringify(
// 		sourceMap,
// 		null,
// 		'  '
// 	)
// )
