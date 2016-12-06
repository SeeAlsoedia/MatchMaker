var mongoose = require('mongoose')
var mongoosastic = require('mongoosastic')

var mongoClient = require('mongodb').MongoClient
var mongoDbObj

module.exports = function(articleUrl, callback) {
	
	mongoClient.connect('mongodb://localhost:27017/WikiDb', function(err, db){
		if(err)
			console.log(err)
		else {
			console.log("Connected to MongoDB")
			mongoDbObj = { 
				db: db,
				articles: db.collection('articles')
			}
			mongoose.connect('mongodb://localhost:27017/WikiDb')

			var articleSchema = new mongoose.Schema({
				_id: {type: mongoose.Schema.Types.ObjectId, es_indexed:true },
				title: {type: String, es_indexed:true },
				url: String,
				md5: String,
				lastUpdated: Date,
				raw: {type: String, es_indexed:true }
			})
			articleSchema.plugin(mongoosastic)

			var articleModel = mongoose.model("articles", articleSchema)

			mongoDbObj.articles.find({url:articleUrl}).toArray(function(err, data){
				if(err){
					console.log(err)
					return null
				}
				else {
					var article = data.shift()
					if (article != null) {
						console.log("Checking the article: " + article.url)
						articleModel.search(
											{"multi_match" : 
												{	
													"query": article.title, 
													"type": "most_fields", 
													"fields": [ "title^2", "raw" ]
												}
											}, 
											{
												from: 1, 
												size: 6, 
												hydrate:true
											}, function(err, results){
							if(err){
								console.log("Error, can't search elasticsearch database. " + err)
								callback(err, null)
							}
							else {
								var array = results.hits.hits
								
								callback(null, array.slice(1, 6))
							}
						})
					}
				}
			})
		}
	})
}