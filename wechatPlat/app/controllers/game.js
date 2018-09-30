const heredoc = require('heredoc')
const ejs = require('ejs')
const util = require('./../../libs/util')
const wx = require('../../wx/index')

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

exports.movie = async function (ctx, next) {
  const wechatApi = wx.getWechat()
  let data = await wechatApi.fetchAccessToken()
  let access_token = data.access_token
  let ticketData = await wechatApi.fetchTicket(access_token)
  let ticket = ticketData.ticket
  let url = `http://${ctx.header.host}${ctx.url}`
  let params = util.sign(ticket, url)
  ctx.body = ejs.render(tpl, params)
}