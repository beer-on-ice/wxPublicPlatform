const sha1 = require('sha1')
const axios = require('axios')
const prefix = 'https://api.weixin.qq.com/cgi-bin/token'
const api = {
  access_token: prefix + '?grant_type=client_credential'
}

function Wechat(opts) {
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
      Promise.resolve(data)
    } else {
      return _this.updateAccessToken()
    }
  }).then(data => {
    _this.access_token = data.access_token
    _this.expires_in = data.expires_in
    _this.saveAccessToken(data)
  })
}

Wechat.prototype.isValidateAccessToken = data => {
  if (!data || !data.access_token || !data.expires_in) return false
  let access_token = data.access_token
  let expires_in = data.expires_in
  let now = (new Date().getTime())
  if (now < expires_in) return true
  else return false
}

Wechat.prototype.updateAccessToken = function () {
  let appID = this.appID
  let appSecret = this.appSecret
  let url = `${api.access_token}&appid=${appID}&secret=${appSecret}`
  return new Promise((resolve, reject) => {
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

module.exports = function (opts) {
  let wechat = new Wechat(opts)
  return function* (next) {
    let token = opts.token
    let signature = this.query.signature
    let nonce = this.query.nonce
    let timestamp = this.query.timestamp
    let echostr = this.query.echostr

    let str = [token, timestamp, nonce].sort().join('')
    let sha = sha1(str)
    if (sha === signature) {
      this.body = echostr + ''
    } else {
      this.body = 'Wrong'
    }
  }
}