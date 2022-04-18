import * as _ from './_.mjs'
import './test.mjs'
import './build.mjs'

const isDryRun = Boolean(process?.env?.npm_config_dryRun)

console.log(), console.log('Publishing...')

_.question.options = { input: process.stdin, output: process.stdout }

_.question('major/minor/path? ').then(answer => {
	answer = answer.trim().toLowerCase()
	if (answer === 'major' || answer === 'minor' || answer === 'patch') {
		if (!isDryRun) _.spawn('npm', ['version', answer])
	}
})
