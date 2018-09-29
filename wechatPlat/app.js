const Koa = require('koa')
const fs = require('fs')

const wechat = require('./wechat/p')
const reply = require('./wx/reply')
const Wechat = require('./wechat/wechat')
const menu = require('./wx/menu')
const wx = require('./wx/index')

const app = new Koa()
const wechatApi = wx.getWechat()

let dbUrl = 'mongodb://localhost:27017/movie'
mongoose.connect(dbUrl, function (err) {
  if (err) {
    console.log(err)
  } else {
    console.log('数据库连接成功');
    app.listen(port, () => {
      console.log('server start on port ' + port);
    });
  }
})

let models_path = __dirname + '/app/models'
let walk = function (path) {
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

wechatApi.delMenu().then(function () {
  return wechatApi.createMenu(menu)
})

app.use(wechat(config.wechat, reply.reply)) //都要进行验证是否来自微信服务器


app.listen('3000', () => console.log('Listening: 3000'))