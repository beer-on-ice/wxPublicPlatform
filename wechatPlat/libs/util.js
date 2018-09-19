const fs = require('fs')

exports.readFileAsync = function (fpath, encoding) {
  return new Promise((resolve, reject) => {
    fs.readFile(fpath, encoding, function (err, content) {
      if (err) reject(err)
      else resolve(content)
    })
  })
}

exports.writeFileAsync = function (fpath, content) {
  return new Promise((resolve, reject) => {
    fs.writeFile(fpath, content, function (err) {
      if (err) reject(err)
      else resolve()
    })
  })
}