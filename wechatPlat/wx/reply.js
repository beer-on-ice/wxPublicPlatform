// 回复策略
const Movie = require('../app/api/movie')
const baseUrl = 'http://kfiwu3.natappfree.cc/movie/'

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
  } else if (message.MsgType === 'voice') {
    let voiceTxt = message.Recognition
    let movies = await Movie.searchByName(voiceTxt)

    if (!movies || movies.length === 0) {
      movies = await Movie.searchByDouban(voiceTxt)
    }

    if (movies || movies.length > 0) {
      reply = []
      movies = movies.slice(0, 3)
      movies.forEach(item => {
        reply.push({
          title: item.title,
          description: item.original_title,
          picUrl: item.poster,
          url: baseUrl + item._id
        })
      });
    } else {
      reply = '没有查询到 ' + content + ' 匹配的电影'
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
    } else {
      let movies = await Movie.searchByName(content)
      if (!movies || movies.length === 0) movies = await Movie.searchByDouban(content)

      if (movies || movies.length > 0) {
        reply = []
        movies = movies.slice(0, 3)
        movies.forEach(item => {
          reply.push({
            title: item.title,
            description: item.original_title,
            picUrl: item.poster,
            url: baseUrl + item._id
          })
        })

      } else {
        reply = '没有查询到 ' + content + ' 匹配的电影'
      }
    }
    ctx.body = reply
  }
  await next
}