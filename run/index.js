process.argv.length < 3
    ? console.log(['', 'node run start', 'node run test', 'node run minify', ''].join('\n'))
: require(require('path').join(__dirname, process.argv[2]))
