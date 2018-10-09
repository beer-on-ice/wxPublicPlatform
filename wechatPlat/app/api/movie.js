const Promise = require('bluebird')
const request = Promise.promisify(require('request'))
const _ = require('lodash')

const Movie = require('../models/movie')
const Category = require('../models/category')

// index page
exports.findAll = async () => await Category
  .find({})
  .populate({
    path: 'movies',
    select: 'title poster',
    options: {
      limit: 6
    }
  })
  .exec()

// search page
exports.searchByCategory = async (catId) => await Category
  .find({
    _id: catId
  })
  .populate({
    path: 'movies',
    select: 'title poster'
  })
  .exec()

exports.searchByName = async (q) => await Movie
  .find({
    title: new RegExp(q + '.*', 'i')
  })
  .exec()

exports.findHotMovies = async (hot, count) => await Movie
  .find({})
  .sort({
    'pv': hot
  })
  .limit(count)
  .exec()

exports.findMoviesByCate = async (cat) => await Category
  .findOne({
    name: cat
  })
  .populate({
    path: 'movies',
    select: 'title poster _id'
  })
  .exec()

exports.searchById = async (id) => await Movie
  .findOne({
    _id: id
  })
  .exec()

const updateMovies = async movie => {
  let options = {
    url: 'https://api.douban.com/v2/movie/subject/' + movie.doubanId,
    json: true
  }

  let response = await request(options)

  let data = response.body

  _.extend(movie, {
    country: data.countries[0],
    language: data.language,
    summary: data.summary
  })

  let genres = movie.genres

  if (genres && genres.length > 0) {
    let cateArray = []

    genres.forEach(genre => {
      cateArray.push(async () => {
        let cat = await Category.findOne({
          name: genre
        }).exec()

        if (cat) {
          cat.movies.push(movie._id)
          await cat.save()
        } else {
          cat = new Category({
            name: genre,
            movies: [movie._id]
          })

          cat = await cat.save()
          movie.category = cat._id
          await movie.save()
        }
      })
    })

    Promise.all(cateArray)
  } else {
    movie.save()
  }
}

exports.searchByDouban = async (q) => {
  let options = {
    url: 'https://api.douban.com/v2/movie/search?q='
  }

  options.url += encodeURIComponent(q)

  let response = await request(options)

  let data = JSON.parse(response.body)
  let subjects = []
  let movies = []

  if (data && data.subjects) {
    subjects = data.subjects
  }

  if (subjects.length > 0) {
    let queryArray = []
    subjects.forEach(item => {
      let t = async () => {
        let movie = await Movie.findOne({
          doubanId: item.id
        })
        if (movie) {
          movies.push(movie)
        } else {
          let directors = item.directors || []
          let director = directors[0] || {}

          movie = new Movie({
            director: director.name || '',
            title: item.title,
            doubanId: item.id,
            poster: item.images.large,
            year: item.year,
            genres: item.genres || []
          })

          movies.push(movie)
          movie = await movie.save()
        }
      }
      queryArray.push(t())
    })

    Promise.all(queryArray).then(() => {
      movies.forEach(movie => {
        updateMovies(movie)
      })
    })
  }
  return movies
}