// 回复策略
const config = require('./config')
const Wechat = require('./wechat/wechat')

const wechatApi = new Wechat(config.wechat)

exports.reply = function* (next) {
  let message = this.weixin

  if (message.MsgType === 'event') {
    if (message.Event === 'subscribe') {
      if (message.EventKey) {
        console.log('扫描二维码进来：' + message.EventKey + '  ' + message.ticket);
      }
      this.body = `哈哈，你订阅了这个号`
    } else if (message.Event === 'unsubscribe') {
      console.log('取关');
      this.body = ''
    } else if (message.Event === 'LOCATION') {
      this.body = `您上报的位置是： ${message.Latitude} / ${message.Longitude} - ${message.Precision} `
    } else if (message.Event === 'CLICK') {
      this.body = `您点击了菜单： ${message.EventKey} `
    } else if (message.Event === 'SCAN') {
      console.log(`关注后扫二维码 ${message.EventKey} ${message.Ticket}`);
      this.body = "看到你扫描了"
    } else if (message.Event === 'VIEW') {
      this.body = `你点击了菜单中的链接: ${message.EventKey}`
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
      let data = yield wechatApi.uploadMaterial('image', __dirname + '/testFile/test.jpg')
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
      let data = yield wechatApi.uploadMaterial('video', __dirname + '/testFile/test.mp4')
      reply = {
        type: 'video',
        title: '回复视频内容',
        description: '打个炮玩玩',
        mediaId: data.media_id
      }
    }
    // 临时素材
    else if (content === '5') {
      let data = yield wechatApi.uploadMaterial('image', __dirname + '/testFile/test.jpg')
      reply = {
        type: 'image',
        mediaId: data.media_id
      }
    }
    // 永久素材 
    else if (content === '6') {
      let data = yield wechatApi.uploadMaterial('video', __dirname + '/testFile/test.mp4', {
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
      let data = yield wechatApi.uploadMaterial('image', __dirname + '/testFile/test.jpg', {
        type: 'image'
      })
      reply = {
        type: 'image',
        mediaId: data.media_id
      }
    }
    // 永久图文素材
    else if (content === '8') {
      let picData = yield wechatApi.uploadMaterial('image', __dirname + '/testFile/test.jpg', {
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
      data = yield wechatApi.uploadMaterial('news', media, {})
      data = yield wechatApi.fetchMaterial(data.media_id, 'news', {})

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
      let counts = yield wechatApi.countMaterial()
      console.log(JSON.stringify(counts));
      let results = yield [
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
    } else if (content === '10') {
      let group = yield wechatApi.createGroup('我是新er分组')
      let groups = yield wechatApi.fetchGroups()
      console.log('添加了 分组 后的分组列表： ' + JSON.stringify(groups))

      let groupWhich = yield wechatApi.checkGroup(message.FromUserName)
      console.log('查看自己的分组： ' + JSON.stringify(groupWhich))

      let groupMove = yield wechatApi.moveGroup(message.FromUserName, 102)
      let groups2 = yield wechatApi.fetchGroups()
      console.log('移动后的分组列表： ' + JSON.stringify(groups2))

      let groupsMove = yield wechatApi.moveGroup([message.FromUserName], 103)
      let groups3 = yield wechatApi.fetchGroups()
      console.log('批量移动后的分组列表： ' + JSON.stringify(groups3))

      let groupupdate = yield wechatApi.updateGroup(105, '改名啦改名啦')
      let groups4 = yield wechatApi.fetchGroups()
      console.log('更新后的分组列表： ' + JSON.stringify(groups4))

      let groupdelete = yield wechatApi.deleteGroup(104)
      let groups5 = yield wechatApi.fetchGroups()
      console.log('删除后的分组列表： ' + JSON.stringify(groups5))
      reply = 'Group done'
    } else if (content === '11') {
      let user = yield wechatApi.fetchUsers(message.FromUserName, 'en')
      console.log(user);
      let openIds = [{
        openid: message.FromUserName,
        lang: 'en'
      }]
      let users = yield wechatApi.fetchUsers(openIds)
      console.log(users);
      reply = JSON.stringify(user)
    } else if (content === '12') {
      let userlist = yield wechatApi.listUsers()
      console.log(userlist);
      reply = userlist.total
    }

    this.body = reply
  }
  yield next
}