const axios = require('axios')
const Promise = require('bluebird')
const _ = require('lodash')

const request = Promise.promisify(require('request'))
const fs = require('fs')
const util = require('./util')
const prefix = 'https://api.weixin.qq.com/cgi-bin/'
const api = {
  access_token: prefix + 'token?grant_type=client_credential',
  temporary: {
    upload: prefix + 'media/upload?'
  },
  permanent:{
    upload: prefix + 'material/add_material?',
    uploadNews: prefix + 'material/add_news?',
    uploadNewsPic: prefix + 'media/uploadimg?'
  }
}

module.exports = class Wechat {
  constructor(opts) {
    this.appID = opts.appID
    this.appSecret = opts.appSecret
    this.getAccessToken = opts.getAccessToken
    this.saveAccessToken = opts.saveAccessToken
    this.fetchAccessToken()
  }
  // 获取最新access_token
  updateAccessToken() {
    return new Promise(resolve => {
      axios({
        method: 'get',
        url: api.access_token,
        params: {
          appid: this.appID,
          secret: this.appSecret
        }
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
  fetchAccessToken() {
    let _this = this
    if (this.access_token && this.expires_in) {
      if (this.isValidateAccessToken(this)) {
        return Promise.resolve(this)
      }
    }
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
      return Promise.resolve(data)
    })
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
  uploadMaterial(type, material,permanent) {
    let _this = this
    let form = {}
    let uploadUrl = api.temporary.upload
    if (permanent) {
      uploadUrl = api.permanent.upload
      _.extend(form,permanent)
    }
    if(type==='pic') {
      uploadUrl = api.permanent.uploadNewsPic
    }
    if (type === 'news') {
      uploadUrl = api.permanent.uploadNews
      form = material
    }
    else {
      form.media = fs.createReadStream(material)
    }

    return new Promise((resolve, reject) => {
      _this.fetchAccessToken().then(data => {
        let url = `${uploadUrl}access_token=${data.access_token}`
        if(!permanent) {
          url += `&type=${type}`
        }else {
          form.access_token = data.access_token
        }

        let options = {
          method: 'POST', 
          url: url, 
          json: true
        }
        if(type === 'news') {
          options.body = form
        } else {
          options.formData = form
        }

        request(options).then(res => {
          let _data = res.body
          console.log(_data);
          
          if (_data) resolve(_data)
          else throw new Error('Upload Material failed')
        }).catch(err => {
          reject(err)
        })
      })
    })
  }
}