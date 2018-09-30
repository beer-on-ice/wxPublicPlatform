/**
 * 2、 验证消息的确来自微信服务器
 */

const sha1 = require('sha1')
const Wechat = require('./wechat')
const util = require('./util')
const getRawBody = require('raw-body')
module.exports = function (opts, handler) {
  let wechat = new Wechat(opts) //生成带有多种方法的wechat类
  return function* (next) {
    let token = opts.token
    let signature = this.query.signature
    let nonce = this.query.nonce
    let timestamp = this.query.timestamp
    let echostr = this.query.echostr

    let str = [token, timestamp, nonce].sort().join('')
    let sha = sha1(str)

    if (this.method === 'GET') {
      if (sha === signature) {
        this.body = echostr + ''
      } else {
        this.body = 'Wrong'
      }
    } else if (this.method === 'POST') {
      if (sha !== signature) {
        this.body = 'Wrong'
        return false
      }

      let data = yield getRawBody(this.req, {
        length: this.length,
        limit: '1mb',
        encoding: this.charset
      })
      let content = yield util.parseXMLAsync(data)
      let message = util.formatMessage(content.xml)

      this.weixin = message
      console.log(this.weixin);

      yield handler.call(this, next)

      wechat.reply.call(this)
      console.log(next);

    }
  }
}