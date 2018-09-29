var mongoose = require('mongoose')
var Schema = mongoose.Schema
var ObjectId = Schema.Types.ObjectId

var MovieSchema = new Schema({
    director: String,
    title:String,
    language: String,
    country: String,
    summary: String,
    flash:String,
    year:Number,
    pv: {
        type: Number,
        default: 0
    },
    poster: String,
    category: {
        type: ObjectId,
        ref: 'Category'
    },
    categoryName: String,
    meta: {
        createAt: {
            type:Date,
            default: Date.now()
        },
        updateAt: {
            type:Date,
            default: Date.now()
        }
    }
})

// 每次在执行save之前执行回调
MovieSchema.pre('save',function(next) {
    if(this.isNew) {
        this.meta.createAt = this.meta.updateAt = Date.now()
    }
    else {
        this.meta.updateAt = Date.now()
    }
    next()
})

// 静态方法
MovieSchema.statics = {
    fetch: function(cb) {
        return this.find({}).sort('meta.updateAt').exec(cb)
    },
    findById(id,cb) {
        return this.find({_id: id}).exec(cb)
    }
}

module.exports = MovieSchema
