const crypto = require('crypto')
const fs = require('fs')

const createNonce = () => Math.random().toString(36).substr(2, 15)
const createTimestamp = () => parseInt(new Date().getTime() / 1000, 10) + ''

// 加密，拿到签名值
const _sign = (noncestr, jsapi_ticket, timestamp, url) => {
  let params = [
    'noncestr=' + noncestr,
    'jsapi_ticket=' + jsapi_ticket,
    'timestamp=' + timestamp,
    'url=' + url
  ]
  let str = params.sort().join('&')
  let shasum = crypto.createHash('sha1')
  shasum.update(str)
  return shasum.digest('hex')
}


exports.sign = (ticket, url) => {
  let noncestr = createNonce()
  let timestamp = createTimestamp()
  let signature = _sign(noncestr, ticket, timestamp, url)
  return {
    noncestr,
    timestamp,
    signature
  }
}


// 读取
exports.readFileAsync = (fpath, encoding) => {
  return new Promise((resolve, reject) => {
    fs.readFile(fpath, encoding, function (err, content) {
      if (err) reject(err)
      else resolve(content)
    })
  })
}

// 写入
exports.writeFileAsync = (fpath, content) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(fpath, content, function (err) {
      if (err) reject(err)
      else resolve()
    })
  })
}