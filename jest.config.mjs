/** @typedef {import('ts-jest')} */

export default /** @type {import('@jest/types').Config.InitialOptions} */ ({
	collectCoverage: true,
	collectCoverageFrom: [
		'src/tokenize.ts',
		'src/lib/*.ts'
	],
	coverageDirectory: 'coverage',
	moduleFileExtensions: [
		'js',
		'ts'
	],
	moduleNameMapper: {
		"^\\./(.*)\\.js$": [
			"./$1.js",
			"./$1.ts"
		]
	},
	roots: [
		'<rootDir>/src'
	],
	testEnvironment: 'node',
	testMatch: [
		'**/*.test.ts'
	],
	verbose: true,
})
