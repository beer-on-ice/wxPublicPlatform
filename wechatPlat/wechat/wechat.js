const axios = require('axios')
const Promise = require('bluebird')
const _ = require('lodash')

const request = Promise.promisify(require('request'))
const fs = require('fs')
const util = require('./util')
const prefix = 'https://api.weixin.qq.com/cgi-bin/'
const mpPrefix = 'https://mp.weixin.qq.com/cgi-bin/'
const semanticUrl = 'https://api.weixin.qq.com/semantic/semproxy/search?'
const api = {
  semanticUrl: semanticUrl,
  access_token: prefix + 'token?grant_type=client_credential',
  temporary: {
    upload: prefix + 'media/upload?',
    fetch: prefix + 'media/get?'
  },
  permanent: {
    upload: prefix + 'material/add_material?',
    uploadNews: prefix + 'material/add_news?',
    uploadNewsPic: prefix + 'media/uploadimg?',
    fetch: prefix + 'material/get_material?',
    del: prefix + 'material/del_material?',
    update: prefix + 'material/update_news?',
    count: prefix + 'material/get_materialcount?',
    batch: prefix + 'material/batchget_material?'
  },
  group: {
    create: prefix + 'groups/create?',
    fetch: prefix + 'groups/get?',
    check: prefix + 'groups/getid?',
    update: prefix + 'groups/update?',
    move: prefix + 'groups/members/update?',
    batchmove: prefix + 'groups/members/batchupdate?',
    del: prefix + 'groups/delete?',
  },
  user: {
    remark: prefix + 'user/info/updateremark?',
    fetch: prefix + 'user/info?',
    batchFetch: prefix + 'user/info/batchget?',
    list: prefix + 'user/get?'
  },
  mass: {
    group: prefix + 'message/mass/sendall?',
    openId: prefix + 'message/mass/send?',
    del: prefix + 'message/mass/delete?',
    preview: prefix + 'message/mass/preview?',
    check: prefix + 'message/mass/get?'
  },
  menu: {
    create: prefix + 'menu/create?',
    get: prefix + 'menu/get?',
    del: prefix + 'menu/delete?',
    current: prefix + 'get_current_selfmenu_info?'
  },
  qrcode: {
    create: prefix + 'qrcode/create?',
    show: mpPrefix + 'showqrcode'
  },
  shorturl: {
    create: prefix + 'shorturl?'
  },
  ticket: {
    get: prefix + 'ticket/getticket?'
  }
}

module.exports = class Wechat {
  constructor(opts) {
    this.appID = opts.appID
    this.appSecret = opts.appSecret
    this.getAccessToken = opts.getAccessToken
    this.saveAccessToken = opts.saveAccessToken
    this.getTicket = opts.getTicket
    this.saveTicket = opts.saveTicket
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
    return this.getAccessToken().then(data => {
      try {
        data = JSON.parse(data)
      } catch (error) {
        return _this.updateAccessToken(data)
      }
      if (_this.isValidateAccessToken(data)) {
        return Promise.resolve(data)
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
  ///////////////  素材   /////////////////////
  uploadMaterial(type, material, permanent) {
    let _this = this
    let form = {}
    let uploadUrl = api.temporary.upload
    if (permanent) {
      uploadUrl = api.permanent.upload
      _.extend(form, permanent)
    }
    if (type === 'pic') {
      uploadUrl = api.permanent.uploadNewsPic
    }
    if (type === 'news') {
      uploadUrl = api.permanent.uploadNews
      form = material
    } else {
      form.media = fs.createReadStream(material)
    }

    return new Promise((resolve, reject) => {
      _this.fetchAccessToken().then(data => {
        let url = `${uploadUrl}access_token=${data.access_token}`
        if (!permanent) {
          url += `&type=${type}`
        } else {
          form.access_token = data.access_token
        }

        let options = {
          method: 'POST',
          url: url,
          json: true
        }
        if (type === 'news') {
          options.body = form
        } else {
          options.formData = form
        }

        request(options).then(res => {
          let _data = res.body
          if (_data) resolve(_data)
          else throw new Error('Upload Material failed')
        }).catch(err => {
          reject(err)
        })
      })
    })
  }
  fetchMaterial(mediaId, type, permanent) {
    let _this = this
    let form = {}
    let fetchUrl = api.temporary.fetch
    if (permanent) fetchUrl = api.permanent.fetch

    return new Promise((resolve, reject) => {
      _this.fetchAccessToken().then(data => {
        let url = `${fetchUrl}access_token=${data.access_token}&media_id=${mediaId}`

        let options = {
          method: 'POST',
          url: url,
          json: true
        }
        if (permanent) {
          form.media_id = mediaId
          form.access_token = data.access_token
          options.body = form
        } else {
          if (type === 'video') {
            url = url.replace('https://', 'http://')
          }
          url += `&media_id=${mediaId}`
        }
        if (type === 'news' || type === 'video') {
          request(options).then(res => {
            let _data = res.body

            if (_data) resolve(_data)
            else throw new Error('fetch Material failed')
          }).catch(err => {
            reject(err)
          })
        } else {
          resolve(url)
        }
      })
    })
  }
  deleteMaterial(mediaId) {
    let _this = this
    let delUrl = api.permanent.del
    let form = {
      media_id: mediaId
    }
    return new Promise((resolve, reject) => {
      _this.fetchAccessToken().then(data => {
        let url = `${delUrl}access_token=${data.access_token}&media_id=${mediaId}`

        let options = {
          method: 'POST',
          url: url,
          json: true,
          body: form
        }

        request(options).then(res => {
          let _data = res.body

          if (_data) resolve(_data)
          else throw new Error('Del Material failed')
        }).catch(err => {
          reject(err)
        })
      })
    })
  }
  updateMaterial(mediaId, news) {
    let _this = this
    let updateUrl = api.permanent.update
    let form = {
      media_id: mediaId
    }
    _.extend(form, news)
    return new Promise((resolve, reject) => {
      _this.fetchAccessToken().then(data => {
        let url = `${updateUrl}access_token=${data.access_token}&media_id=${mediaId}`

        let options = {
          method: 'POST',
          url: url,
          json: true,
          body: form
        }

        request(options).then(res => {
          let _data = res.body
          if (_data) resolve(_data)
          else throw new Error('update Material failed')
        }).catch(err => {
          reject(err)
        })
      })
    })
  }
  countMaterial() {
    let _this = this
    let countUrl = api.permanent.count
    console.log(countUrl);
    return new Promise((resolve, reject) => {
      _this.fetchAccessToken().then(data => {
        let url = `${countUrl}access_token=${data.access_token}`
        let options = {
          method: 'GET',
          url: url,
          json: true
        }

        request(options).then(res => {
          let _data = res.body
          if (_data) resolve(_data)
          else throw new Error('count Material failed')
        }).catch(err => {
          reject(err)
        })
      })
    })
  }
  batchMaterial(options) {
    let _this = this
    let batchUrl = api.permanent.batch
    options.type = options.type || 'image'
    options.offset = options.offset || 0
    options.count = options.count || 1

    return new Promise((resolve, reject) => {
      _this.fetchAccessToken().then(data => {
        let url = `${batchUrl}access_token=${data.access_token}`
        let params = {
          method: 'POST',
          url: url,
          json: true,
          body: options
        }

        request(params).then(res => {
          let _data = res.body
          if (_data) resolve(_data)
          else throw new Error('batch Material failed')
        }).catch(err => {
          reject(err)
        })
      })
    })
  }
  /////////////////  用户管理 /////////////////
  createGroup(name) {
    let _this = this
    let createUrl = api.group.create

    return new Promise((resolve, reject) => {
      _this.fetchAccessToken().then(data => {
        let url = `${createUrl}access_token=${data.access_token}`
        let form = {
          group: {
            name: name
          }
        }
        let params = {
          method: 'POST',
          url: url,
          json: true,
          body: form
        }

        request(params).then(res => {
          let _data = res.body
          if (_data) resolve(_data)
          else throw new Error('create Material failed')
        }).catch(err => {
          reject(err)
        })
      })
    })
  }
  fetchGroups() {
    let _this = this
    let fetchUrl = api.group.fetch

    return new Promise((resolve, reject) => {
      _this.fetchAccessToken().then(data => {
        let url = `${fetchUrl}access_token=${data.access_token}`
        let params = {
          url: url,
          json: true
        }

        request(params).then(res => {
          let _data = res.body
          if (_data) resolve(_data)
          else throw new Error('fetch Material failed')
        }).catch(err => {
          reject(err)
        })
      })
    })
  }
  checkGroup(openId) {
    let _this = this
    let checkUrl = api.group.check

    return new Promise((resolve, reject) => {
      _this.fetchAccessToken().then(data => {
        let url = `${checkUrl}access_token=${data.access_token}`
        let form = {
          openid: openId
        }
        let params = {
          method: 'POST',
          url: url,
          json: true,
          body: form
        }

        request(params).then(res => {
          let _data = res.body
          if (_data) resolve(_data)
          else throw new Error('check Material failed')
        }).catch(err => {
          reject(err)
        })
      })
    })
  }
  updateGroup(id, name) {
    let _this = this
    let updateUrl = api.group.update

    return new Promise((resolve, reject) => {
      _this.fetchAccessToken().then(data => {
        let url = `${updateUrl}access_token=${data.access_token}`
        let form = {
          group: {
            id: id,
            name: name
          }
        }
        let params = {
          method: 'POST',
          url: url,
          json: true,
          body: form
        }

        request(params).then(res => {
          let _data = res.body
          if (_data) resolve(_data)
          else throw new Error('update Material failed')
        }).catch(err => {
          reject(err)
        })
      })
    })
  }
  moveGroup(openIds, to) {
    let _this = this
    let moveUrl = api.group.move
    let batchmoveUrl = api.group.batchmove

    return new Promise((resolve, reject) => {
      _this.fetchAccessToken().then(data => {
        let url;
        let form = {
          to_groupid: to
        }
        if (_.isArray(openIds)) {
          url = `${batchmoveUrl}access_token=${data.access_token}`
          form.openid_list = openIds
        } else {
          url = `${moveUrl}access_token=${data.access_token}`
          form.openid = openIds
        }

        let params = {
          method: 'POST',
          url: url,
          json: true,
          body: form
        }

        request(params).then(res => {
          let _data = res.body
          if (_data) resolve(_data)
          else throw new Error('Move Material failed')
        }).catch(err => {
          reject(err)
        })
      })
    })
  }
  deleteGroup(id) {
    let _this = this
    let deleteUrl = api.group.del

    return new Promise((resolve, reject) => {
      _this.fetchAccessToken().then(data => {
        let url = `${deleteUrl}access_token=${data.access_token}`
        let form = {
          group: {
            id: id
          }
        }
        let params = {
          method: 'POST',
          url: url,
          json: true,
          body: form
        }

        request(params).then(res => {
          let _data = res.body
          if (_data) resolve(_data)
          else throw new Error('Delete Material failed')
        }).catch(err => {
          reject(err)
        })
      })
    })
  }
  ////// 用户操作 ///////
  remarkUser(openId, remark) {
    let _this = this
    let remarkUrl = api.user.remark

    return new Promise((resolve, reject) => {
      _this.fetchAccessToken().then(data => {
        let url = `${remarkUrl}access_token=${data.access_token}`
        let form = {
          openid: openId,
          remark: remark
        }
        let params = {
          method: 'POST',
          url: url,
          json: true,
          body: form
        }

        request(params).then(res => {
          let _data = res.body
          if (_data) resolve(_data)
          else throw new Error('Remark Material failed')
        }).catch(err => {
          reject(err)
        })
      })
    })
  }
  fetchUsers(openIds, lang) {
    let _this = this
    let fetchUrl = api.user.fetch
    let batchFetchUrl = api.user.batchFetch
    lang = lang || 'zh_CN'
    let url;
    return new Promise((resolve, reject) => {
      _this.fetchAccessToken().then(data => {
        let params = {
          json: true
        }
        if (_.isArray(openIds)) {
          params.url = `${batchFetchUrl}access_token=${data.access_token}`
          params.method = 'POST'
          params.body = {
            user_list: openIds
          }
        } else {
          params.url = `${fetchUrl}access_token=${data.access_token}&openid=${openIds}&lang=${lang}`
        }

        request(params).then(res => {
          let _data = res.body
          if (_data) resolve(_data)
          else throw new Error('BatchFetch Material failed')
        }).catch(err => {
          reject(err)
        })
      })
    })
  }
  listUsers(openId) {
    let _this = this
    let listUrl = api.user.list

    return new Promise((resolve, reject) => {
      _this.fetchAccessToken().then(data => {
        let url = `${listUrl}access_token=${data.access_token}`
        if (openId) {
          url += `&next_openid=${openId}`
        }

        let params = {
          url: url,
          json: true
        }

        request(params).then(res => {
          let _data = res.body
          if (_data) resolve(_data)
          else throw new Error('ListUser Material failed')
        }).catch(err => {
          reject(err)
        })
      })
    })
  }
  ////////// 群发 ///////////
  sendByGroup(type, message, groupId) {
    let _this = this
    let sendUrl = api.mass.group

    let msg = {
      filter: {},
      msgtype: type
    }

    if (!groupId) {
      msg.filter.is_to_all = true
    } else {
      msg.filter = {
        is_to_all: false,
        tag_id: groupId
      }
    }

    msg[type] = message

    return new Promise((resolve, reject) => {
      _this.fetchAccessToken().then(data => {
        let url = `${sendUrl}access_token=${data.access_token}`
        let params = {
          method: "POST",
          url: url,
          json: true,
          body: msg
        }

        request(params).then(res => {
          let _data = res.body
          if (_data) resolve(_data)
          else throw new Error('Send To Group failed')
        }).catch(err => {
          reject(err)
        })
      })
    })
  }
  sendByOpenIds(type, message, openIds) {
    let _this = this
    let sendUrl = api.mass.openId

    let msg = {
      msgtype: type,
      touser: openIds
    }

    msg[type] = message

    return new Promise((resolve, reject) => {
      _this.fetchAccessToken().then(data => {
        let url = `${sendUrl}access_token=${data.access_token}`
        let params = {
          method: "POST",
          url: url,
          json: true,
          body: msg
        }

        request(params).then(res => {
          let _data = res.body
          if (_data) resolve(_data)
          else throw new Error('Send To OpenIds failed')
        }).catch(err => {
          reject(err)
        })
      })
    })
  }
  deleteMass(msgId, articleId) {
    let _this = this
    let delUrl = api.mass.del

    return new Promise((resolve, reject) => {
      _this.fetchAccessToken().then(data => {
        let url = `${delUrl}access_token=${data.access_token}`
        let form = {
          msg_id: msgId
        }
        if (articleId) form.article_idx = articleId
        let params = {
          method: "POST",
          url: url,
          json: true,
          body: form
        }

        request(params).then(res => {
          let _data = res.body
          if (_data) resolve(_data)
          else throw new Error('Delete failed')
        }).catch(err => {
          reject(err)
        })
      })
    })
  }
  previewMass(type, message, openId) {
    let _this = this
    let previewUrl = api.mass.preview

    let msg = {
      msgtype: type,
      touser: openId
    }
    msg[type] = message

    return new Promise((resolve, reject) => {
      _this.fetchAccessToken().then(data => {
        let url = `${previewUrl}access_token=${data.access_token}`
        let params = {
          method: "POST",
          url: url,
          json: true,
          body: msg
        }

        request(params).then(res => {
          let _data = res.body
          if (_data) resolve(_data)
          else throw new Error('Preview failed')
        }).catch(err => {
          reject(err)
        })
      })
    })
  }
  checkMass(msgId) {
    let _this = this
    let checkUrl = api.mass.check

    return new Promise((resolve, reject) => {
      _this.fetchAccessToken().then(data => {
        let url = `${checkUrl}access_token=${data.access_token}`
        let params = {
          method: "POST",
          url: url,
          json: true,
          body: {
            msg_id: msgId
          }
        }

        request(params).then(res => {
          let _data = res.body
          if (_data) resolve(_data)
          else throw new Error('Check failed')
        }).catch(err => {
          reject(err)
        })
      })
    })
  }
  /////// 菜单 ///////
  createMenu(menu) {
    let _this = this
    let createUrl = api.menu.create

    return new Promise((resolve, reject) => {
      _this.fetchAccessToken().then(data => {
        let url = `${createUrl}access_token=${data.access_token}`
        let params = {
          method: "POST",
          url: url,
          json: true,
          body: menu
        }

        request(params).then(res => {
          let _data = res.body
          if (_data) resolve(_data)
          else throw new Error('Create Menu failed')
        }).catch(err => {
          reject(err)
        })
      })
    })
  }
  getMenu() {
    let _this = this
    let getUrl = api.menu.get

    return new Promise((resolve, reject) => {
      _this.fetchAccessToken().then(data => {
        let url = `${getUrl}access_token=${data.access_token}`
        let params = {
          url: url,
          json: true
        }

        request(params).then(res => {
          let _data = res.body
          if (_data) resolve(_data)
          else throw new Error('Get Menu failed')
        }).catch(err => {
          reject(err)
        })
      })
    })
  }
  delMenu() {
    let _this = this
    let deleteUrl = api.menu.del

    return new Promise((resolve, reject) => {
      _this.fetchAccessToken().then(data => {
        let url = `${deleteUrl}access_token=${data.access_token}`
        let params = {
          url: url,
          json: true
        }

        request(params).then(res => {
          let _data = res.body
          if (_data) resolve(_data)
          else throw new Error('Delete Menu failed')
        }).catch(err => {
          reject(err)
        })
      })
    })
  }
  currentMenu() {
    let _this = this
    let currentUrl = api.menu.current

    return new Promise((resolve, reject) => {
      _this.fetchAccessToken().then(data => {
        let url = `${currentUrl}access_token=${data.access_token}`
        let params = {
          url: url,
          json: true
        }

        request(params).then(res => {
          let _data = res.body
          if (_data) resolve(_data)
          else throw new Error('Get Current Menu failed')
        }).catch(err => {
          reject(err)
        })
      })
    })
  }
  ////////////// 二维码 ////////////////
  createQrcode(qr) {
    let _this = this
    let createUrl = api.qrcode.create

    return new Promise((resolve, reject) => {
      _this.fetchAccessToken().then(data => {
        let url = `${createUrl}access_token=${data.access_token}`
        let params = {
          method: 'POST',
          url: url,
          json: true,
          body: qr
        }

        request(params).then(res => {
          let _data = res.body
          if (_data) resolve(_data)
          else throw new Error('Create Qrcode failed')
        }).catch(err => {
          reject(err)
        })
      })
    })
  }
  showQrcode(ticket) {
    let _this = this
    let showUrl = api.qrcode.show

    return `${showUrl}ticket=${encodeURI(ticket)}`
  }
  createShorturl(action, longurl) {
    let _this = this
    let createUrl = api.qrcode.create
    action = action || 'long2short'
    return new Promise((resolve, reject) => {
      _this.fetchAccessToken().then(data => {
        let url = `${createUrl}access_token=${data.access_token}`
        let params = {
          method: 'POST',
          url: url,
          json: true,
          body: {
            action: action,
            long_url: longurl
          }
        }

        request(params).then(res => {
          let _data = res.body
          if (_data) resolve(_data)
          else throw new Error('Create Qrcode failed')
        }).catch(err => {
          reject(err)
        })
      })
    })
  }
  ////////////// 智能接口 ////////////////
  semantic(semanticData) {
    let _this = this
    let semanticUrl = api.semanticUrl
    return new Promise((resolve, reject) => {
      _this.fetchAccessToken().then(data => {
        let url = `${semanticUrl}access_token=${data.access_token}`
        semanticData.appid = data.appID
        let params = {
          method: 'POST',
          url: url,
          json: true,
          body: data
        }

        request(params).then(res => {
          let _data = res.body
          if (_data) resolve(_data)
          else throw new Error('Semantic failed')
        }).catch(err => {
          reject(err)
        })
      })
    })
  }

  ///////// js_sdk //////////
  fetchTicket(access_token) {
    let _this = this
    return this.getTicket().then(data => {
      try {
        data = JSON.parse(data)
      } catch (error) {
        return _this.updateTicket(access_token)
      }
      if (_this.isValidateTicket(data)) {
        return Promise.resolve(data)
      } else {
        return _this.updateTicket(access_token)
      }
    }).then(data => {
      _this.saveTicket(data)
      return Promise.resolve(data)
    })
  }
  updateTicket(access_token) {
    return new Promise(resolve => {
      axios({
        method: 'get',
        url: api.ticket.get,
        params: {
          access_token: access_token,
          type: 'jsapi'
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
  isValidateTicket(data) {
    if (!data || !data.ticket || !data.expires_in) return false
    let ticket = data.ticket
    let expires_in = data.expires_in
    let now = (new Date().getTime())
    if (ticket && now < expires_in) return true
    else return false
  }
}