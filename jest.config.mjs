/** @typedef {import('ts-jest')} */

export default /** @type {import('@jest/types').Config.InitialOptions} */ ({
	collectCoverage: true,
	collectCoverageFrom: [
		'src/index.ts',
		'src/lib/*.ts'
	],
	coverageDirectory: 'coverage',
	moduleFileExtensions: [
		'js',
		'ts'
	],
	roots: [
		'<rootDir>/src'
	],
	testEnvironment: 'node',
	testMatch: [
		'**/*.test.ts'
	],
	verbose: true,
})
