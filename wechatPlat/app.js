const Koa = require('koa')

const wechat = require('./wechat/p')
const config = require('./config')
const weixin = require('./weixin')

const app = new Koa()

app.use(wechat(config.wechat, weixin.reply)) //都要进行验证是否来自微信服务器

app.listen('3000', () => {
  console.log('Listening: 3000');
})