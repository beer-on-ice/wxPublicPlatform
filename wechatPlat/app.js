const Koa = require('koa')

const wechat = require('./wechat/p')
const config = require('./config')
const reply = require('./wx/reply')

const app = new Koa()

app.use(wechat(config.wechat, reply.reply)) //都要进行验证是否来自微信服务器

app.listen('3000', () => {
  console.log('Listening: 3000');
})