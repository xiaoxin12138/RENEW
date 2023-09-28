const db = wx.cloud.database();
const app = getApp();
const config = require("../../config.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    ids: -1,
    wxnum: '',
    qqnum: '',
    email: '',
    name: '',
    checked: false,
    campus: JSON.parse(config.data).campus,
    mye: null,
  },

  onChange(event) {
    if (event.detail == true) {
      wx.requestSubscribeMessage({
        tmplIds: ['VeGTTE2DgTg7n-CC0J4SvQk3f_vyugMHVfxjTdeEa64'], //这里填入我们生成的模板id
        success(res) {
          console.log('授权成功', res)
        },
        fail(res) {
          console.log('授权失败', res)
        }
      })
    }
    this.setData({
      checked: event.detail,
    });
  },

  choose(e) {
    let that = this;
    that.setData({
      ids: e.detail.value
    })
    //下面这种办法无法修改页面数据
    /* this.data.ids = e.detail.value;*/
  },
  wxInput(e) {
    this.data.wxnum = e.detail.value;
  },
  nameInput(e) {
    this.data.name = e.detail.value;
  },
  emInput(e) {
    this.data.email = e.detail.value;
  },
  stuInput(e) {
    this.data.stunum = e.detail.value;
  },

  getUserInfo(e) {
    let that = this;
    console.log(e);

    // 正则判断是否有字母
    let pattern = /^[0-9]+$/;
    let isNumber = pattern.test(that.data.email);
    console.log(that.data.email);
    // if (!isNumber) {
    //   wx.showToast({
    //     title: '请输入正确的手机号码',
    //     icon: 'none',
    //     duration: 2000
    //   });
    //   return;
    // } 

    let test = e.detail.errMsg.indexOf("ok");
    if (test == '-1') {
      wx.showToast({
        title: '请授权后方可使用',
        icon: 'none',
        duration: 2000
      });
    } else {
      that.setData({
        userInfo: e.detail.userInfo
      })
      that.check(e);
    }
  },
  //校检
  check(e) {
    let that = this;
    wx.showLoading({
      title: '正在登录',
    })
    // //提交数据
    //      //使用自己的java后端...
    //      //BUG 登录需要等两次
    wx.login({
      success: (res) => {
        const code = res.code;
        console.log("code: " + code);
        wx.request({
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          url: app.host + '/user/wx/login',
          method: 'POST',
          dataType: 'JSON',
          data: {
            code: code,
            rawData: e.detail.rawData,
            signature: e.detail.signature,
            signature: e.detail.signature,
            // campus: this.data.ids,  // 0西丽湖 1.留仙洞 2 官龙山
            // email: this.data.email, //其实是手机号 
            // wxnum: this.data.wxnum,
            // name: this.data.name,
            // stunum: this.data.stunum,
          },
          success: (res3) => {
            if (res3) {
              console.log(res3);
              var res3data = JSON.parse(res3.data)
              console.log(res3data);
              //判断是否成功 1成功 0失败
              if(res3data.code == 1){
              app.userinfo = e.detail.userInfo;
              app.openid = res3data.data.openid
              //ok
              console.log(app.userinfo);
              wx.navigateBack({})
              wx.setStorageSync('token', res3data.data.token)
              this.onLoad()
              }else{
                wx.navigateBack({})
              }
              // TODO: 缺少TOKEN存储
            }
          },
        })

      },
      fail() {
        wx.hideLoading();
        wx.showToast({
          title: '注册失败，请重新提交',
          icon: 'none',
        })
      }
    })

  },

  //获取授权的点击事件
  shouquan() {
    wx.requestSubscribeMessage({
      tmplIds: ['6DGzsKqipoPxClnbkvwnxY9GqdXoLordLRdWTjJN1F0', 'XXmEjf37meLWQaEsOX6qkkufcVH-YKAL3cHyY9Lru0Q'], //这里填入我们生成的模板id
      success(res) {
        console.log('授权成功', res)
      },
      fail(res) {
        console.log('授权失败', res)
      }
    })
  },
})