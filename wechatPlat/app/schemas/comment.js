var mongoose = require('mongoose')
var Schema = mongoose.Schema
var ObjectId = Schema.Types.ObjectId

var CommentSchema = new mongoose.Schema({
  movie: {
    type: ObjectId,
    ref: 'Movie'
  },
  from: {
    type: ObjectId,
    ref: 'User'
  },
  content: String,
  reply: [{
    from: {
      type: ObjectId,
      ref: 'User'
    },
    to: {
      type: ObjectId,
      ref: 'User'
    },
    content: String
  }],
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
CommentSchema.pre('save', function (next) {
  if (this.isNew) {
    this.meta.createAt = this.meta.updateAt = Date.now()
  } else {
    this.meta.updateAt = Date.now()
  }
  next()
})

// 静态方法
CommentSchema.statics = {
  fetch: function (cb) {
    return this.find({}).sort('meta.updateAt').exec(cb)
  },
  findById(id, cb) {
    return this.find({
      _id: id
    }).exec(cb)
  }
}

module.exports = CommentSchema