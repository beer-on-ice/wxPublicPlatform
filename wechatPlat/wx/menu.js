module.exports = {
  "button": [{
      "name": "点击事件",
      "type": "click",
      "key": "menu_click"
    },
    {
      "name": "点出事件",
      "sub_button": [{
          "type": "view",
          "name": "跳转URL",
          "url": "http://github.com/"
        }, {
          "type": "scancode_push",
          "name": "扫码推送事件",
          "key": "rselfmenu_0_1"
        },
        {
          "type": "scancode_waitmsg",
          "name": "扫码带提示",
          "key": "rselfmenu_0_0"
        }, {
          "type": "pic_sysphoto",
          "name": "系统拍照发图",
          "key": "rselfmenu_1_0"
        }, {
          "type": "pic_photo_or_album",
          "name": "拍照或者相册发图",
          "key": "rselfmenu_1_1"
        }
      ]
    },
    {
      "name": "点出事件2",
      "sub_button": [{
          "type": "pic_weixin",
          "name": "微信相册发图",
          "key": "rselfmenu_1_2"
        }, {
          "name": "发送位置",
          "type": "location_select",
          "key": "rselfmenu_2_0"
        },
        {
          "type": "media_id",
          "name": "下发图片",
          "media_id": "Bp7ugLVGgHpaa6iMdqe_mHTeHpzxH_SbOWOiwcl5nS8"
        }
        // , {
        //   "type": "view_limited",
        //   "name": "图文消息",
        //   "media_id": "Bp7ugLVGgHpaa6iMdqe_mKus1kY3b4ot4Q7oAQeYviE"
        // }
      ]
    }
  ]
}