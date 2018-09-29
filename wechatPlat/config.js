/**
 * 1、 填写服务器配置
 */
const path = require('path')
const util = require('./libs/util')
const wechat_file = path.resolve(__dirname, './config/wechat.txt')
const wechat_ticket_file = path.resolve(__dirname, './config/wechat_ticket.txt')

const config = {
  wechat: {
    appID: 'wx65c6e5af07a88786',
    appSecret: '01a5c36f2bec30dcedeead6fb0bc9ad5',
    token: 'lijinchaojidatiancaihaha',
    // 读取access_token
    getAccessToken() {
      return util.readFileAsync(wechat_file)
    },
    // 写入access_token
    saveAccessToken(data) {
      data = JSON.stringify(data)
      return util.writeFileAsync(wechat_file, data)
    },
    // 读取ticket
    getTicket() {
      return util.readFileAsync(wechat_ticket_file)
    },
    // 写入ticket
    saveTicket(data) {
      data = JSON.stringify(data)
      return util.writeFileAsync(wechat_ticket_file, data)
    }
  }
}

module.exports = config