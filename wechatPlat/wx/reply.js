// 回复策略
const path = require('path')
const wx = require('./index')
const wechatApi = wx.getWechat()


exports.reply = async function (ctx, next) {
  let message = ctx.weixin

  if (message.MsgType === 'event') {
    if (message.Event === 'subscribe') {
      if (message.EventKey) {
        console.log('扫描二维码进来：' + message.EventKey + '  ' + message.ticket);
      }
      ctx.body = `欢迎关注电影大王\n
      回复 1~18，测试\n
      回复 首页， 进入电影首页\n
      回复 电影名字，查询电影信息\n
      某些功能订阅号无权限，如网页授权\n
      回复 语音，查询电影信息\n
      也可以点击 <a href="http://ydiwh3.natappfree.cc/movie">语音查电影</a>
      `
    } else if (message.Event === 'unsubscribe') {
      console.log('取关');
      ctx.body = ''
    } else if (message.Event === 'LOCATION') {
      ctx.body = `您上报的位置是： ${message.Latitude} / ${message.Longitude} - ${message.Precision} `
    } else if (message.Event === 'CLICK') {
      ctx.body = `您点击了菜单： ${message.EventKey} `
    } else if (message.Event === 'SCAN') {
      console.log(`关注后扫二维码 ${message.EventKey} ${message.Ticket}`);
      ctx.body = "看到你扫描了"
    } else if (message.Event === 'VIEW') {
      ctx.body = `你点击了菜单中的链接: ${message.EventKey}`
    } else if (message.Event === 'scancode_push') {
      console.log(message.ScanCodeInfo.ScanType);
      console.log(message.ScanCodeInfo.ScanResult);
      ctx.body = `你点击了菜单中的链接: ${message.EventKey}`
    } else if (message.Event === 'scancode_waitmsg') {
      console.log(message.ScanCodeInfo.ScanType);
      console.log(message.ScanCodeInfo.ScanResult);
      ctx.body = `你点击了菜单中的链接: ${message.EventKey}`
    } else if (message.Event === 'pic_sysphoto') {
      console.log(message.SendPicsInfo.PicList);
      console.log(message.SendPicsInfo.Count);
      ctx.body = `你点击了菜单中的链接: ${message.EventKey}`
    } else if (message.Event === 'pic_photo_or_album') {
      console.log(message.SendPicsInfo.PicList);
      console.log(message.SendPicsInfo.Count);
      ctx.body = `你点击了菜单中的链接: ${message.EventKey}`
    } else if (message.Event === 'pic_weixin') {
      console.log(message.SendPicsInfo.PicList);
      console.log(message.SendPicsInfo.Count);
      ctx.body = `你点击了菜单中的链接: ${message.EventKey}`
    } else if (message.Event === 'location_select') {
      console.log(message.Location_X);
      console.log(message.Location_Y);
      console.log(message.Scale);
      console.log(message.Label);
      console.log(message.Poiname);
      ctx.body = `你点击了菜单中的链接: ${message.EventKey}`
    } else if (message.Event === 'media_id') {
      ctx.body = `你点击了菜单中的链接: ${message.EventKey}`
    } else if (message.Event === 'view_limited') {
      ctx.body = `你点击了菜单中的链接: ${message.EventKey}`
    }
  } else if (message.MsgType === 'text') {
    let content = message.Content
    let reply = `你说的 ${content} 太复杂了,我还不能理解`
    if (content === '1') {
      reply = '开发者是超级大天才'
    } else if (content === '2') {
      reply = [{
          title: '天才改变世界',
          description: '开心就好',
          picUrl: 'http://pic2.52pk.com/files/160216/5329500_160443_1.png',
          url: 'https://blog.csdn.net/ganyingxie123456/article/details/78152770'
        },
        {
          title: '天才改变世界2',
          description: '开心就好2',
          picUrl: 'http://pic2.52pk.com/files/160216/5329500_160443_1.png',
          url: 'https://blog.csdn.net/ganyingxie123456/article/details/78152770'
        }
      ]
    } else if (content === '3') {
      let data = await wechatApi.uploadMaterial('image', path.resolve(__dirname, '../testFile/test.jpg'))
      reply = {
        type: 'music',
        title: '回复音乐内容',
        description: '轻松一下',
        musicUrl: 'http://m10.music.126.net/20180920171130/7fef55827d1fb20cf643d9545f844ec3/ymusic/9cb2/aad4/17f3/9ce10c0feced90a3db98fd806f79c33d.mp3',
        thumbMediaId: data.media_id
      }
    }
    // 临时素材 
    else if (content === '4') {
      let data = await wechatApi.uploadMaterial('video', path.resolve(__dirname, '../testFile/test.mp4'))
      reply = {
        type: 'video',
        title: '回复视频内容',
        description: '打个炮玩玩',
        mediaId: data.media_id
      }
    }
    // 临时素材
    else if (content === '5') {
      let data = await wechatApi.uploadMaterial('image', path.resolve(__dirname, '../testFile/test.jpg'))
      reply = {
        type: 'image',
        mediaId: data.media_id
      }
    }
    // 永久素材 
    else if (content === '6') {
      let data = await wechatApi.uploadMaterial('video', path.resolve(__dirname, '../testFile/test.mp4'), {
        type: 'video',
        description: '{"title":"funny,fuck","introduction":"Never think it so easy"}'
      })
      reply = {
        type: 'video',
        title: '回复视频内容',
        description: '打个炮玩玩',
        mediaId: data.media_id
      }
    }
    // 永久素材
    else if (content === '7') {
      let data = await wechatApi.uploadMaterial('image', path.resolve(__dirname, '../testFile/2.jpg'), {
        type: 'image'
      })
      reply = {
        type: 'image',
        mediaId: data.media_id
      }
    }
    // 永久图文素材
    else if (content === '8') {
      let picData = await wechatApi.uploadMaterial('image', path.resolve(__dirname, '../testFile/2.jpg'), {
        type: 'image'
      }, {})

      let media = {
        articles: [{
          title: 'tututu',
          thumb_media_id: picData.media_id,
          author: 'Genius',
          "digest": '不想写摘要',
          "show_cover_pic": 1,
          "content": '不想写内容',
          "content_source_url": 'https://www.zhihu.com/question/20462061/answer/495050961'
        }, {
          title: 'tutut2',
          thumb_media_id: picData.media_id,
          author: 'Genius',
          "digest": '不想写摘要',
          "show_cover_pic": 1,
          "content": '不想写内容',
          "content_source_url": 'https://www.zhihu.com/question/20462061/answer/495050961'
        }, {
          title: 'tutut3',
          thumb_media_id: picData.media_id,
          author: 'Genius',
          "digest": '不想写摘要',
          "show_cover_pic": 1,
          "content": '不想写内容',
          "content_source_url": 'https://www.zhihu.com/question/20462061/answer/495050961'
        }]
      }
      data = await wechatApi.uploadMaterial('news', media, {})
      console.log(data.media_id);

      data = await wechatApi.fetchMaterial(data.media_id, 'news', {})

      let items = data.news_item
      let news = []
      items.forEach(el => {
        news.push({
          title: el.title,
          description: el.digest,
          picUrl: picData.url,
          url: el.url
        })
      });

      reply = news
    } else if (content === '9') {
      let counts = await wechatApi.countMaterial()
      console.log(JSON.stringify(counts));
      let results = await [
        wechatApi.batchMaterial({
          offset: 0,
          count: 10,
          type: 'image'
        }),
        wechatApi.batchMaterial({
          offset: 0,
          count: 10,
          type: 'music'
        }),
        wechatApi.batchMaterial({
          offset: 0,
          count: 10,
          type: 'video'
        }),
        wechatApi.batchMaterial({
          offset: 0,
          count: 10,
          type: 'voice'
        })
      ]
      console.log(JSON.stringify(results));
      reply = '1'
    } else if (content === '10') {
      // let group = await wechatApi.createGroup('我是新er分组')
      let groups = await wechatApi.fetchGroups()
      console.log('添加了 分组 后的分组列表： ' + JSON.stringify(groups))

      let groupWhich = await wechatApi.checkGroup(message.FromUserName)
      console.log('查看自己的分组： ' + JSON.stringify(groupWhich))

      let groupMove = await wechatApi.moveGroup(message.FromUserName, 102)
      let groups2 = await wechatApi.fetchGroups()
      console.log('移动后的分组列表： ' + JSON.stringify(groups2))

      let groupsMove = await wechatApi.moveGroup([message.FromUserName], 0)
      let groups3 = await wechatApi.fetchGroups()
      console.log('批量移动后的分组列表： ' + JSON.stringify(groups3))

      let groupupdate = await wechatApi.updateGroup(103, '改名啦改名啦2')
      let groups4 = await wechatApi.fetchGroups()
      console.log('更新后的分组列表： ' + JSON.stringify(groups4))

      let groupdelete = await wechatApi.deleteGroup(107)
      let groups5 = await wechatApi.fetchGroups()
      console.log('删除后的分组列表： ' + JSON.stringify(groups5))
      reply = 'Group done'
    } else if (content === '11') {
      let user = await wechatApi.fetchUsers(message.FromUserName, 'en')
      let openIds = [{
        openid: message.FromUserName,
        lang: 'en'
      }]
      let users = await wechatApi.fetchUsers(openIds)
      reply = JSON.stringify(user)
    } else if (content === '12') {
      let userlist = await wechatApi.listUsers()
      console.log(userlist);

      reply = userlist.total
    } else if (content === '13') {
      let mpnews = {
        "media_id": "Bp7ugLVGgHpaa6iMdqe_mKus1kY3b4ot4Q7oAQeYviE"
      }
      let text = {
        "content": "Hello, Wechat"
      }
      // let msgData = await wechatApi.sendByGroup("mpnews", mpnews, 0)
      let msgData = await wechatApi.sendByGroup("text", text, 0)
      reply = 'Yeah,Group Send!'
    } else if (content === '14') {
      let mpnews = {
        "media_id": "Bp7ugLVGgHpaa6iMdqe_mKus1kY3b4ot4Q7oAQeYviE"
      }
      // let text = {
      //   "content": "Hello, Wechat"
      // }
      let msgData = await wechatApi.previewMass("mpnews", mpnews, 'ojBKE0jXxAnQyfgRctwpAwDYz_qk')
      reply = 'Yeah,Preview'
    } else if (content === '15') {
      let msgData = await wechatApi.previewMass('')
      reply = 'Yeah,Success'
    } else if (content === '16') {
      let tmpQr = {
        expire_seconds: 40000,
        action_name: 'QR_SCENE',
        action_info: {
          scene: {
            scene_id: 123
          }
        }
      }
      let permQr = {
        action_name: 'QR_LIMIT_SCENE',
        action_info: {
          scene: {
            scene_id: 123
          }
        }
      }
      let permStrQr = {
        action_name: 'QR_LIMIT_STR_SCENE',
        action_info: {
          scene: {
            scene_str: "genius"
          }
        }
      }
      let qr1 = await wechatApi.createQrcode(tmpQr)
      let qr2 = await wechatApi.createQrcode(permQr)
      let qr3 = await wechatApi.createQrcode(permStrQr)
      reply = 'Qrcode Created'
    } else if (content === '17') {
      let longurl = 'http://ofo91.info/'
      let shortData = await wechatApi.createShorturl(null, longurl)

      reply = shortData.short_url
    } else if (content === '18') {
      let semanticData = {
        query: '复仇者联盟',
        city: '苏州',
        category: 'movie',
        uid: message.FromUserName
      }
      let _semanticData = await wechatApi.semantic(semanticData)

      reply = JSON.stringify(_semanticData)
    }

    ctx.body = reply
  }
  await next
}