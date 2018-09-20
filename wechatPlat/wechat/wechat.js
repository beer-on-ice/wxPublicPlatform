const axios = require('axios')
const util = require('./util')
const prefix = 'https://api.weixin.qq.com/cgi-bin/token'
const api = {
  access_token: prefix + '?grant_type=client_credential'
}

module.exports = class Wechat {
  constructor(opts) {
    let _this = this
    this.appID = opts.appID
    this.appSecret = opts.appSecret
    this.getAccessToken = opts.getAccessToken
    this.saveAccessToken = opts.saveAccessToken
    this.getAccessToken().then(data => {
      try {
        data = JSON.parse(data)
      } catch (error) {
        return _this.updateAccessToken(data)
      }
      if (_this.isValidateAccessToken(data)) {
        return data
      } else {
        return _this.updateAccessToken()
      }
    }).then(data => {
      _this.access_token = data.access_token
      _this.expires_in = data.expires_in
      _this.saveAccessToken(data)
    })
  }
  // 获取最新access_token
  updateAccessToken() {
    let url = `${api.access_token}&appid=${this.appID}&secret=${this.appSecret}`
    return new Promise(resolve => {
      axios({
        method: 'get',
        url: url,
        jsonp: true
      }).then(res => {
        let data = res.data
        let now = new Date().getTime()
        let expires_in = now + (data.expires_in - 20) * 1000
        data.expires_in = expires_in
        resolve(data)
      })
    })
  }
  // 校验过期时间
  isValidateAccessToken(data) {
    if (!data || !data.access_token || !data.expires_in) return false
    let access_token = data.access_token
    let expires_in = data.expires_in
    let now = (new Date().getTime())
    if (now < expires_in) return true
    else return false
  }
  // 回复
  reply() {
    let content = this.body
    let message = this.weixin

    let xml = util.tpl(content, message)
    this.status = 200
    this.type = 'application/xml'
    this.body = xml
  }
}