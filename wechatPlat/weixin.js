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
      reply = '李锦天才'
    } else if (content === '2') {
      reply = '李锦大天才'
    } else if (content === '3') {
      reply = '李锦超大天才'
    } else if (content === '4') {
      reply = '李锦超级大天才'
    } else if (content === '5') {
      reply = [{
        title: '天才改变世界',
        description: '开心就好',
        picUrl: 'http://pic2.52pk.com/files/160216/5329500_160443_1.png',
        url: 'https://blog.csdn.net/ganyingxie123456/article/details/78152770'
      }]
    }
    this.body = reply
  }
  yield next
}