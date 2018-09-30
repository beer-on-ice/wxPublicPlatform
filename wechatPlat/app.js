const Koa = require('koa')
const Router = require('koa-router')
const logger = require('koa-logger')
const fs = require('fs')
const mongoose = require('mongoose')

const menu = require('./wx/menu')
const wx = require('./wx/index')
const game = require('./app/controllers/game')
const wechat = require('./app/controllers/wechat')

const app = new Koa()
const router = new Router()
const wechatApi = wx.getWechat()

let dbUrl = 'mongodb://localhost:27017/movie'
mongoose.connect(
  dbUrl,
  (err) => {
    if (err) console.log(err)
    else app.listen(3001, () => console.log('server start on port ' + 3001))
  }
)
let models_path = __dirname + '/app/models'
let walk = (path) => {
  fs.readdirSync(path).forEach(function (file) {
    let newPath = path + '/' + file
    let stat = fs.statSync(newPath)

    if (stat.isFile()) {
      if (/(.*)\.(js|coffee)/.test(file)) {
        require(newPath)
      }
    } else if (stat.isDirectory()) {
      walk(newPath)
    }
  })
}
walk(models_path)

wechatApi.delMenu().then(() => wechatApi.createMenu(menu))


// const wechat = require('./wechat/p')
// const reply = require('./wx/reply')
// app.use(wechat(wx.wechatOpts.wechat, reply.reply)) //都要进行验证是否来自微信服务器

router.get('/wx', wechat.hear)
router.post('/wx', wechat.hear)
// router.use('/wx', wechat.hear)
router.get('/movie', game.movie)


app.use(logger())
app.use(router.routes()).use(router.allowedMethods())
app.listen('3000', () => console.log('Listening: 3000'))