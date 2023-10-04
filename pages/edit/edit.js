const db = wx.cloud.database();
const app = getApp();
const config = require("../../config.js");
let subscribeMessageAuthResult = null;
let onchange = null;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    ids: -1,
    wxnum: '',
    qqnum: '',
    email: '',
    checked: false,
    campus: JSON.parse(config.data).campus,
  },
  goToPage: function () {
    wx.navigateTo({
      url: '/pages/privacys/privacys',
    });
    this.setData({
      checked: true,
    });
  },
  onChange(event) {
    onchange = event.detail;
    if (event.detail == true) {
      wx.requestSubscribeMessage({
        tmplIds: ['VeGTTE2DgTg7n-CC0J4SvcoW45xs3HhtIfLC_Os1sY0'], //这里填入我们生成的模板id
        success(res) {
          console.log('已同意', res)
          subscribeMessageAuthResult = res;
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
  getdetail() {
    let that = this;
    // db.collection('user').where({
    //       _openid: app.openid
    // }).get({
    //       success: function(res) {
    //             let info = res.data[0];
    //             that.setData({
    //                   phone: info.phone,
    //                   qqnum: info.qqnum,
    //                   wxnum: info.wxnum,
    //                   email: info.email,
    //                   ids: info.campus.id,
    //                   _id: info._id
    //             })
    //       },
    //       fail() {
    //             wx.showToast({
    //                   title: '获取失败',
    //                   icon: 'none'
    //             })
    //             let e = setTimeout(
    //                  // wx.navigateBack({}), 2000
    //             )
    //       }
    // })
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
  addInput(e) {
    this.data.add = e.detail.value;
  },
  getUserInfo(e) {
    let that = this;
    console.log(e);
    if (subscribeMessageAuthResult && subscribeMessageAuthResult.errMsg === 'requestSubscribeMessage:ok' && onchange == true) {
      that.setData({
        userInfo: e.detail.userInfo
      })
      //验证手机号
      const checkphoneNumber = this.data.email
      if(!/^\d{11}$/.test(checkphoneNumber)){
        wx.showToast({
          title: "请输入11位数字的手机号",
          icon: "none",
          duration: 2000,
        })
        return
      }
      //验证姓名
      const checkname = this.data.name
      if(!checkname){
        wx.showToast({
          title: "请输入姓名",
          icon: "none",
          duration: 2000,
        })
        return
      }
      //验证学号
      const checkstunum = this.data.stunum
      if(!/^\d{8}$/.test(checkstunum)){
        wx.showToast({
          title: "请输入正确的学号",
          icon: "none",
          duration: 2000,
        })
        return
      }
      //验证地址
      const checkadd = this.data.add
      if(!checkadd){
        wx.showToast({
          title: "请输入地址",
          icon: "none",
          duration: 2000,
        })
        return
      }
      that.check(e);
    } else {
      wx.showToast({
        title: '请同意用户协议和隐私政策',
        icon: 'none',
        duration: 2000
      });
    }
  },
  onLoad(e) {
    this.getdetail(e);
    onchange = false;
  },
  //校检
  check(e) {

    let that = this;
    //校检手机
    let phone = that.data.phone;
    if (phone == '') {
      wx.showToast({
        title: '请先获取您的电话',
        icon: 'none',
        duration: 2000
      });
      return false
    }
    //校检校区
    let ids = that.data.ids;
    let campus = that.data.campus;
    if (ids == -1) {
      wx.showToast({
        title: '请先获取您的校区',
        icon: 'none',
        duration: 2000
      });
    }
    //校检邮箱
    let email = that.data.email;
    // if (!(/^\w+((.\w+)|(-\w+))@[A-Za-z0-9]+((.|-)[A-Za-z0-9]+).[A-Za-z0-9]+$/.test(email))) {
    //       wx.showToast({
    //             title: '请输入常用邮箱',
    //             icon: 'none',
    //             duration: 2000
    //       });
    //       return false;
    // }
    //校检QQ号
    let qqnum = that.data.qqnum;
    // if (qqnum !== '') {
    //       if (!(/^\s*[.0-9]{5,11}\s*$/.test(qqnum))) {
    //             wx.showToast({
    //                   title: '请输入正确QQ号',
    //                   icon: 'none',
    //                   duration: 2000
    //             });
    //             return false;
    //       }
    // }
    //校检微信号
    let wxnum = that.data.wxnum;
    // if (wxnum !== '') {
    //       if (!(/^[a-zA-Z]([-_a-zA-Z0-9]{5,19})+$/.test(wxnum))) {
    //             wx.showToast({
    //                   title: '请输入正确微信号',
    //                   icon: 'none',
    //                   duration: 2000
    //             });
    //             return false;
    //       }
    // }
    wx.showLoading({
      title: '正在提交',
    })
    // db.collection('user').doc(that.data._id).update({
    //       data: {
    //             phone: that.data.phone,
    //             campus: that.data.campus[that.data.ids],
    //             qqnum: that.data.qqnum,
    //             email: that.data.email,
    //             wxnum: that.data.wxnum,
    //             info: that.data.userInfo,
    //             updatedat: new Date().getTime(),
    //       },
    //       success: function(res) {
    //             console.log(res)
    //             db.collection('user').doc(that.data._id).get({
    //                   success: function(res) {
    //                         app.userinfo = res.data;
    //                         app.openid = res.data._openid;
    //                         wx.hideLoading();
    //                         wx.showToast({
    //                               title: '修改成功',
    //                               icon: 'success'
    //                         })
    //                   },
    //             })
    //       },
    //       fail() {
    //             wx.hideLoading();
    //             wx.showToast({
    //                   title: '注册失败，请重新提交',
    //                   icon: 'none',
    //             })
    //       }
    // })
    wx.request({
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      url: app.host + '/user/wx/edit',
      method: 'POST',
      dataType: 'JSON',
      data: {
        campus: this.data.ids,  // 0西丽湖 1.留仙洞 2 官龙山
        phone: this.data.email, //其实是手机号 
        wxnum: this.data.wxnum,
        name: this.data.name,
        stunum: this.data.stunum,
        add: this.data.add,
      },
      success: (res) => {
        if (res) {
          console.log(res);
          var res3data = JSON.parse(res.data)
          console.log(res3data);
          //判断是否成功 1成功 0失败
          if (res3data.code == 1) {
            //ok
            wx.showToast({
              title: '修改成功',
              icon: 'none',
              duration: 1000
            })
            wx.navigateBack({})
            this.onLoad(e)
          } else {
            wx.showToast({
              title: '修改失败',
              icon: 'none',
              duration: 1000,
            })
            wx.navigateBack({})
          }
          // TODO: 缺少TOKEN存储
        }
      },
    })

  },

})
