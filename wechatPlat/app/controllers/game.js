const heredoc = require('heredoc')
const ejs = require('ejs')
const util = require('./../../libs/util')

const wx = require('../../wx/index')
const wechatApi = wx.getWechat()

let tpl = heredoc(function () {
  /*
     <!DOCTYPE html>
     <html>
      <head>
        <title>电影之王</title>
        <meta name="viewport" content="initial-scale=1,maximum-scale=1,minimum-scale=1">
      </head>
      <body>
        <h1>点击标题，开始录音翻译</h1>
        <p id="title"></p>
        <div id="driector"></div>
        <div id="year"></div>
        <div id="poster"></div>
        <script src = "https://cdn.bootcss.com/zepto/1.2.0/zepto.min.js"></script>
        <script src = 'https://res.wx.qq.com/open/js/jweixin-1.4.0.js'></script>
        <script>
          wx.config({
            debug: false, 
            appId: 'wx65c6e5af07a88786',
            timestamp: '<%= timestamp %>', 
            nonceStr: '<%= noncestr %>',
            signature: '<%= signature %>', 
            jsApiList: [
              'startRecord',
              'stopRecord',
              'onVoiceRecordEnd',
              'translateVoice',
              'onMenuShareTimeline',
              'onMenuShareAppMessage',
              'onMenuShareQQ',
              'onMenuShareWeibo',
              'previewImage'
            ] // 必填，需要使用的JS接口列表
          })
          wx.ready(function () {
            wx.checkJsApi({
              jsApiList: ['onVoiceRecordEnd'],
              success: function (res) {
                console.log('Api可用')
              }
            })

            let shareContent = {
              title: '大天才',
              desc: '大天才写的 ',
              link: 'https://ofo91.info',
              imgUrl: 'http://img4.imgtn.bdimg.com/it/u=2641702916,2870615316&fm=200&gp=0.jpg',
              success() {
                window.alert('分享成功')
              },
              cancel() {
                window.alert('取消分享')
              }
            }             
            wx.onMenuShareAppMessage(shareContent);
            let slides;
            let isRecording = false

            $('#poster').on('click',()=>{
              wx.previewImage(slides);
            })
            $('h1').on('click', function () {
              if (!isRecording) {
                isRecording = true
                wx.startRecord({
                  cancel() {
                    window.alert('那就不能搜索了')
                  }
                })
                return
              }
              isRecording = false
              wx.stopRecord({
                success (res) {
                  let localId = res.localId
                  wx.translateVoice({
                    localId: localId,
                    isShowProgressTips: 1,
                    success (res) {
                      let result = res.translateResult
                      $.ajax({
                        type: 'get',
                        url: 'http://api.douban.com/v2/movie/search?q=' + result,
                        dataType: 'jsonp',
                        jsonp: 'callback',
                        success(data) {
                          let subject = data.subjects[0]
                          $('#director').html(subject.directors[0].name)
                          $('#poster').html('<img src='+ subject.images.large + '>')
                          $('#title').html(subject.title)
                          $('#year').html(subject.year)

                          shareContent = {
                            title: subject.title,
                            desc: '我搜出来了' + subject.title,
                            link: 'https://github.com',
                            imgUrl: subject.images.large,
                            success() {
                              window.alert('分享成功')
                            },
                            cancel() {
                              window.alert('取消分享')
                            }
                          }

                          slides = {
                            current: subject.images.large,
                            urls: [subject.images.large]
                          }
                          data.subjects.forEach(item=>{
                            slides.urls.push(item.images.large)
                          })
                          
                          wx.onMenuShareAppMessage(shareContent);
                        }
                      })
                    }
                  });
                }
              })
            })
          })
        </script>
      </body>
     </html>
  */
})

exports.movie = function* (next) {
  let data = yield wechatApi.fetchAccessToken()
  let access_token = data.access_token
  let ticketData = yield wechatApi.fetchTicket(access_token)
  let ticket = ticketData.ticket
  let url = this.href
  let params = util.sign(ticket, url)
  this.body = ejs.render(tpl, params)
}


app.use(wechat(config.wechat, reply.reply)) //都要进行验证是否来自微信服务器


app.listen('3000', () => console.log('Listening: 3000'))
'use strict'

var mongoose = require('mongoose')
var User = mongoose.model('User')
var Comment = mongoose.model('Comment')
var wx = require('../../wx/index')
var util = require('../../libs/util')
var Movie = require('../api/movie')
var options = require('../../options.json')
var request = require('request')

exports.guess = function* (next) {
  var wechatApi = wx.getWechat()
  var data = yield wechatApi.fetchAccessToken()
  var access_token = data.access_token
  var ticketData = yield wechatApi.fetchTicket(access_token)
  var ticket = ticketData.ticket
  var url = this.href.replace(':8000', '')
  var params = util.sign(ticket, url)

  yield this.render('wechat/game', params)
}


exports.jump = function* (next) {
  var movieId = this.params.id
  var redirect = encodeURIComponent(options.baseUrl + '/wechat/movie/' + movieId)
  // var redirect = options.baseUrl + '/wechat/movie/' + movieId
  var url = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + options.appID + '&redirect_uri=' + redirect + '&response_type=code&scope=snsapi_base&state=' + movieId + '#wechat_redirect'

  this.redirect(url)
}


exports.find = function* (next) {
  var code = this.query.code
  var openUrl = 'https://api.weixin.qq.com/sns/oauth2/access_token?appid=' + options.appID + '&secret=' + options.appSecret + '&code=' + code + '&grant_type=authorization_code'

  var response = yield request({
    url: openUrl
  })
  var body = JSON.parse(response.body)
  var openid = body.openid
  var user = yield User.findOne({
    openid: openid
  }).exec()

  if (!user) {
    user = new User({
      openid: openid,
      password: 'imoocimooc',
      name: Math.random().toString(36).substr(2)
    })

    user = yield user.save()
  }

  this.session.user = user
  this.state.user = user

  var id = this.params.id
  var wechatApi = wx.getWechat()
  var data = yield wechatApi.fetchAccessToken()
  var access_token = data.access_token
  var ticketData = yield wechatApi.fetchTicket(access_token)
  var ticket = ticketData.ticket
  var url = this.href.replace(':8000', '')
  var params = util.sign(ticket, url)
  var movie = yield Movie.searchById(id)
  var comments = yield Comment
    .find({
      movie: id
    })
    .populate('from', 'name')
    .populate('reply.from reply.to', 'name')
    .exec()

  params.movie = movie
  params.comments = comments

  yield this.render('wechat/movie', params)
}