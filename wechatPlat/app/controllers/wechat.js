const wechat = require('../../wechat/p')
const reply = require('../../wx/reply')
const wx = require('../../wx/index')
// bug ---
exports.hear = async function (ctx, next) {
  let handles = await wechat(wx.wechatOpts.wechat, reply.reply)
  // handles(next)
}