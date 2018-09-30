const wechat = require('../../wechat/p')
const reply = require('../../wx/reply')
const wx = require('../../wx/index')
// bug ---
exports.hear = async function (ctx, next) {
  ctx.body = '1'
  let handles = await wechat(ctx, wx.wechatOpts.wechat, reply.reply)
  await handles(ctx, next)
}