var mongoose = require('mongoose')
var bcrypt = require('bcryptjs') // 密码加盐
var SALT_WORK_FACTOR = 10 //强度

var UserSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true
  },
  password: String,
  //  0 : normal user
  //  1 : verified user
  //  2 : advanced user
  //  >10: admin
  role: {
    type: Number,
    default: 0
  },
  meta: {
    createAt: {
      type: Date,
      default: Date.now()
    },
    updateAt: {
      type: Date,
      default: Date.now()
    }
  }
})
// 每次在执行save之前执行回调
UserSchema.pre('save', function (next) {
  var user = this
  if (this.isNew) {
    this.meta.createAt = this.meta.updateAt = Date.now()
  } else {
    this.meta.updateAt = Date.now()
  }
  // 加盐加密
  bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
    if (err) return next(err)
    bcrypt.hash(user.password, salt, function (err, hash) {
      if (err) return next(err)
      user.password = hash
      next()
    })
  })
})
// 静态方法
UserSchema.statics = {
  fetch: function (cb) {
    return this.find({}).sort('meta.updateAt').exec(cb)
  },
  findById(id, cb) {
    return this.find({
      _id: id
    }).exec(cb)
  }
}

// 实例方法
UserSchema.methods = {
  comparePassword: function (_password, cb) {
    bcrypt.compare(_password, this.password, function (err, isMatch) {
      if (err) return cb(err)
      cb(null, isMatch)
    })
  }
}
module.exports = UserSchema