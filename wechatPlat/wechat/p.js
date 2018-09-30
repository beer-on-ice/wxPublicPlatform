/**
 * 2、 验证消息的确来自微信服务器
 */

const sha1 = require('sha1')
const Wechat = require('./wechat')
const util = require('./util')
const getRawBody = require('raw-body')
module.exports = function (ctx, opts, handler) {
  let wechat = new Wechat(opts) //生成带有多种方法的wechat类
  return async function (next) {
    let token = opts.token
    let signature = ctx.query.signature
    let nonce = ctx.query.nonce
    let timestamp = ctx.query.timestamp
    let echostr = ctx.query.echostr

    let str = [token, timestamp, nonce].sort().join('')
    let sha = sha1(str)

    if (ctx.method === 'GET') {
      if (sha === signature) {
        ctx.body = echostr + ''
      } else {
        ctx.body = 'Wrong'
      }
    } else if (ctx.method === 'POST') {
      if (sha !== signature) {
        ctx.body = 'Wrong'
        return false
      }

      let data = await getRawBody(ctx.req, {
        length: ctx.lengths,
        limit: '1mb',
        encoding: ctx.charset
      })

      let content = await util.parseXMLAsync(data)
      let message = util.formatMessage(content.xml)

      ctx.weixin = message

      await handler.call(ctx, next)

      wechat.reply.call(ctx)
    }
  }
}