var Movie = require('../api/movie')

exports.index = async (ctx, next) => {
  var categories = await Movie.findAll()

  await ctx.render('pages/index', {
    title: '微信电影课程首页',
    categories: categories
  })
}

exports.search = async (ctx, next) => {
  var catId = ctx.query.cat
  var q = ctx.query.q
  var page = parseInt(ctx.query.p, 10) || 0
  var count = 2
  var index = page * count

  if (catId) {
    var categories = await Movie.searchByCategory(catId)
    var category = categories[0] || {}
    let movies = category.movies || []
    let results = movies.slice(index, index + count)

    await ctx.render('pages/results', {
      title: '结果列表页面',
      keyword: category.name,
      currentPage: (page + 1),
      query: 'cat=' + catId,
      totalPage: Math.ceil(movies.length / count),
      movies: results
    })
  } else {
    let movies = await Movie.searchByName(q)
    let results = movies.slice(index, index + count)

    await ctx.render('pages/results', {
      title: 'imooc 结果列表页面',
      keyword: q,
      currentPage: (page + 1),
      query: 'q=' + q,
      totalPage: Math.ceil(movies.length / count),
      movies: results
    })
  }
}