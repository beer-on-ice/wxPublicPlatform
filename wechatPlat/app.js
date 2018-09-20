const Koa = require('koa')

const wechat = require('./wechat/p')
const config = require('./config')
const weixin = require('./weixin')

const app = new Koa()

app.use(wechat(config.wechat, weixin.reply))

app.listen('3000', () => {
  console.log('Listening: 3000');
})