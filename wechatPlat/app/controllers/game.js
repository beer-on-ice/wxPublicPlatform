const util = require('./../../libs/util')
const wx = require('../../wx/index')
const pug = require('pug')
const Movie = require('../api/movie')

exports.guess = async function (ctx, next) {
  const wechatApi = wx.getWechat()
  let data = await wechatApi.fetchAccessToken()
  let access_token = data.access_token
  let ticketData = await wechatApi.fetchTicket(access_token)
  let ticket = ticketData.ticket
  let url = `http://${ctx.header.host}${ctx.url}`
  let params = util.sign(ticket, url)
  ctx.body = await pug.renderFile('app/views/wechat/game.pug', params)
}

exports.find = async function (ctx, next) {
  let id = ctx.params.id
  const wechatApi = wx.getWechat()
  let data = await wechatApi.fetchAccessToken()
  let access_token = data.access_token
  let ticketData = await wechatApi.fetchTicket(access_token)
  let ticket = ticketData.ticket
  let url = `http://${ctx.header.host}${ctx.url}`
  let params = util.sign(ticket, url)

  let movie = await Movie.searchById(id)
  params.movie = movie
  ctx.body = await pug.renderFile('app/views/wechat/movie.pug', params)
}