let { dirname, join } = require('path')
let { gzipSync, constants: { Z_BEST_COMPRESSION } } = require('zlib')
let { minify } = require('terser')
let { mkdirSync, readFileSync, writeFileSync } = require('fs')

let name = 'CSSOM.parse'

console.log(`\nBuilding ${name}...\n`)

let minifyOpts = {
	toplevel: true,
	keep_classnames: false,
	keep_fnames: false,
	compress: {
		unsafe: true,
		loops: false,
		global_defs: {}
	}
}

let webStdSize = buildWebStd()
let webMinSize = buildWebMin()

console.log(
	`${name} (web, standard): ${indent(webStdSize, webMinSize)}${webStdSize} B\n` +
	`${name} (web, minified): ${indent(webMinSize, webStdSize)}${webMinSize} B\n`
)

function buildWebStd() {
	let filepath = join(__dirname, '..', 'parse', 'index.js')
	let filedata = replaceModuleRequire(
		trimTrailingScript(
			replaceRequireStatements(
				replaceGlobalDefs(
					moveVariablesToGlobalDefs(
						readFileSync(filepath, 'utf8'),
						minifyOpts.compress.global_defs
					),
					minifyOpts.compress.global_defs
				),
				{
					'../cssom': 'CSSOM',
					'../tokenize': 'CSSOM.tokenize'
				}
			)
		),
		name
	)
	let filesize = gzipSync(filedata, Z_BEST_COMPRESSION).length
	let destpath = join(__dirname, '..', 'parse', 'web', 'index.js')

	mkdirSync(dirname(destpath), { recursive: true })
	writeFileSync(destpath, filedata)

	return filesize
}

function buildWebMin() {
	let filepath = join(__dirname, '..', 'parse', 'index.js')
	let filedata = replaceModuleRequire(
		trimTrailingScript(
			minify(
				replaceRequireStatements(
					moveVariablesToGlobalDefs(
						readFileSync(filepath, 'utf8'),
						minifyOpts.compress.global_defs
					),
					minifyOpts
				)
			).code
		),
		name
	)
	let filesize = gzipSync(filedata, Z_BEST_COMPRESSION).length
	let destpath = join(__dirname, '..', 'parse', 'web', 'min.js')

	mkdirSync(dirname(destpath), { recursive: true })
	writeFileSync(destpath, filedata)

	return filesize
}

function indent(a, b) {
	return ' '.repeat(Math.max(String(b).length - String(a).length, 0))
}

function replaceRequireStatements(code, replacements) {
	replacements = Object(replacements)

	return code.replace(
		/^([\t ]*(?:var +(?:[A-Za-z]+) *= )?)require\('([^']+)'\)([^\n]*\n)/gm,
		($0, lead, path, tail) => {
			return path in replacements ? (lead + replacements[path] + tail) : ''
		}
	)
}

function replaceModuleRequire(code, replacement) {
	return code.replace(/module\.exports/gm, replacement)
}

function trimTrailingScript(code) {
	return code.replace(/^[ \f\n\r;]+|[ \f\n\r;]+$/g, '')
}

function moveVariablesToGlobalDefs(code, globalDefs) {
	return code.replace(/^var ([A-Z_]+) += (0x[0-9A-F]+)( *\/\/[^\n]*)?\n/gm, ($0, $1, $2) => {
		globalDefs[$1] = Number($2)
		return ''
	})
}

function replaceGlobalDefs(code, globalDefs) {
	Object.keys(globalDefs).sort((a, b) => b.length - a.length).forEach(name => {
		code = code.replace(new RegExp(name, 'g'), globalDefs[name])
	})
	return code
}
