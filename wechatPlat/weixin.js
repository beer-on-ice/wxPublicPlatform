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
    let reply = `你说的${content}太复杂了`
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
      let data = yield wechatApi.uploadMaterial('image', __dirname + '/test.jpg')
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
      let data = yield wechatApi.uploadMaterial('video', __dirname + '/test.mp4')
      reply = {
        type: 'video',
        title: '回复视频内容',
        description: '打个炮玩玩',
        mediaId: data.media_id
      }
    }
    // 临时素材
    else if (content === '5') {
      let data = yield wechatApi.uploadMaterial('image', __dirname + '/test.jpg')
      reply = {
        type: 'image',
        mediaId: data.media_id
      }
    }
    // 永久素材 
    else if (content === '6') {
      let data = yield wechatApi.uploadMaterial('video', __dirname + '/test.mp4', {
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
      let data = yield wechatApi.uploadMaterial('image', __dirname + '/test.jpg', {
        type: 'image'
      })
      reply = {
        type: 'image',
        mediaId: data.media_id
      }
    }

    this.body = reply
  }
  yield next
}