const path = require('path')
const util = require('./libs/util')
const wechat_file = path.resolve(__dirname, './config/wechat.txt')

const config = {
  wechat: {
    appID: 'wx65c6e5af07a88786',
    appSecret: '01a5c36f2bec30dcedeead6fb0bc9ad5',
    token: 'lijinchaojidatiancaihaha',
    getAccessToken() {
      return util.readFileAsync(wechat_file)
    },
    saveAccessToken(data) {
      data = JSON.stringify(data)
      return util.writeFileAsync(wechat_file, data)
    }
  }
}

module.exports = config