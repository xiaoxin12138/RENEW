const db = wx.cloud.database();
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bigImg: '',
    isExist: Boolean, //如果存在的话就是真，不存在的话就是假
    openid: app.openid
  },
  onLoad() {
    this.getCodeFromSet();
  },

  getCodeFromSet() {
    let that = this;
    let openid = app.openid
    console.log(openid)
    wx.request({
      url: app.host + '/oss/eqImage',
      method: 'GET',
      data: {
        opid: app.openid,
      },
      success: function (res) {
        console.log(res.data[0].picture)
        const regex = /"/g;
        const result = res.data[0].picture.replace(regex, '');
        that.setData({
          isExist: true,
          bigImg: result
        })
      }
    })
  },


  changeBigImg() {
    let that = this;
    wx.chooseImage({
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        wx.showLoading({
          title: '上传中',
        });
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        let filePath = res.tempFilePaths[0];
        wx.uploadFile({
          url: app.host + '/oss/upload',
          filePath: filePath,
          name: 'file',
          success: function (res) {
            console.log('上传成功', res.data);
            console.log(app.openid)
            wx.request({
              url: app.host + '/oss/uploader',
              method: 'GET',
              data: {
                str: res.data,
                opid: app.openid,
              },
              success: function (res) {
                console.log(res.data)
                wx.hideLoading();
                that.onLoad()
              }
            })
          },
          fail: function (res) {
            console.log('上传失败', res);
          }
        })


      }
    })
  },
})