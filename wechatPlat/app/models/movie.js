let mongoose = require('mongoose')
let MovieSchema = require('../schemas/movie')

let mongoosePages = require('mongoose-pages')
mongoosePages.skip(MovieSchema) // 分页

let Movie = mongoose.model('Movie',MovieSchema)

module.exports = Movie
