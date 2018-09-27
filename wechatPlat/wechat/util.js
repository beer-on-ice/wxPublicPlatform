const xml2js = require('xml2js')
const tpl = require('./tpl')

// node 中 json 与 xml 相互转化
exports.parseXMLAsync = xml => {
  return new Promise((resolve, reject) => {
    xml2js.parseString(xml, {
      trim: true
    }, function (err, content) {
      if (err) reject(err)
      else resolve(content)
    })
  })
}

// 把交互信息格式化
function formatMessage(result) {
  let message = {}
  if (typeof result === 'object') {
    let keys = Object.keys(result)
    for (let i = 0; i < keys.length; i++) {
      let item = result[keys[i]]
      let key = keys[i]
      if (!(item instanceof Array) || item.length === 0) {
        continue
      }

      if (item.length === 1) {
        let val = item[0]
        if (typeof val === 'object') {
          message[key] = formatMessage(val)
        } else {
          message[key] = (val || '').trim()
        }
      } else {
        message[key] = []
        for (let j = 0, k = item.length; j < k; j++) {
          message[key].push(formatMessage(item[j]))
        }
      }
    }
  }
  return message
}

// 生成回复模板
exports.tpl = function (content, message) {
  let info = {}
  let type = 'text'

  let fromUserName = message.FromUserName
  let toUserName = message.ToUserName

  if (Array.isArray(content)) type = 'news'

  info.msgType = content.type || type
  info.content = content
  info.createTime = new Date().getTime()
  info.toUserName = fromUserName
  info.fromUserName = toUserName

  return tpl.compiled(info)
}

exports.formatMessage = formatMessage