var matchMaker = require('./matchmaker.js')

matchMaker("https://pt.wikipedia.org/wiki/Efeito_colateral", function(err, data) {
	console.log(data)
})