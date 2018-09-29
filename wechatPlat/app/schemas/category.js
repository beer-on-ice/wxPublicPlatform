let mongoose = require('mongoose')
let Schema = mongoose.Schema
let ObjectId = Schema.Types.ObjectId

let CategorySchema = new Schema({
    name: String,
    movies: [{
        type: ObjectId,
        ref: 'Movie'
    }],
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
CategorySchema.pre('save',function(next) {
    if(this.isNew) {
        this.meta.createAt = this.meta.updateAt = Date.now()
    }
    else {
        this.meta.updateAt = Date.now()
    }
    next()
})

// 静态方法
CategorySchema.statics = {
    fetch: function(cb) {
        return this.find({}).sort('meta.updateAt').exec(cb)
    },
    findById(id,cb) {
        return this.find({_id: id}).exec(cb)
    }
}

module.exports = CategorySchema
