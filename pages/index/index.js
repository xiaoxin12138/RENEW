const app = getApp()
const db = wx.cloud.database();
const config = require("../../config.js");
const _ = db.command;
Page({
  data: {
    college: JSON.parse(config.data).college,
    collegeCur: -2,
    showList: false,
    scrollTop: 0,
    nomore: false,
    adShow: false,
    list: [],
    banner: '',
    indexTip: '今天学习用品有值得购买的新物品',
    openid: app.openid
  },
  // 用户点击右上角分享给好友,要先在分享好友这里设置menus的两个参数,才可以分享朋友圈
  onShareAppMessage: function () {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
  },
  //用户点击右上角分享朋友圈
  onShareTimeline: function () {
    return {
      title: '',
      query: {
        key: value
      },
      imageUrl: ''
    }
  },
  onLoad() {
    this.listkind();
    this.getbanner();

  },

  //监测屏幕滚动
  onPageScroll: function (e) {
    this.setData({
      scrollTop: parseInt((e.scrollTop) * wx.getSystemInfoSync().pixelRatio)
    })
  },


  //获取上次布局记忆
  listkind() {
    let that = this;
    wx.getStorage({
      key: 'iscard',
      success: function (res) {
        that.setData({
          iscard: res.data
        })
      },
      fail() {
        that.setData({
          iscard: true,
        })
      }
    })
  },
  //布局方式选择
  changeCard() {
    let that = this;
    if (that.data.iscard) {
      that.setData({
        iscard: false
      })
      wx.setStorage({
        key: 'iscard',
        data: false,
      })
    } else {
      that.setData({
        iscard: true
      })
      wx.setStorage({
        key: 'iscard',
        data: true,
      })
    }
  },
  //跳转搜索
  search() {
    wx.navigateTo({
      url: '/pages/search/search',
    })
  },
  //类别选择
  collegeSelect(e) {
    console.log(e.currentTarget.dataset.id)
    this.setData({
      collegeCur: e.currentTarget.dataset.id - 1,
      scrollLeft: (e.currentTarget.dataset.id - 3) * 100,
      showList: false,
    })
    this.getList();
  },
  //选择全部
  selectAll() {
    this.setData({
      collegeCur: -2,
      scrollLeft: -200,
      showList: false,
    })
    this.getList();
  },
  //展示列表小面板
  showlist() {
    let that = this;
    if (that.data.showList) {
      that.setData({
        showList: false,
      })
    } else {
      that.setData({
        showList: true,
      })
    }
  },
  getList() {
    //每次20条记录

    console.log("调用了getlist 获取商品")
    let that = this;
    if (that.data.collegeCur == -2) {
      var collegeid = -1; //除-2之外所有
    } else {
      var collegeid = that.data.collegeCur + '' //小程序搜索必须对应格式
    }
    //刷新功能不正常 可能与skip获取异常有关
    var skip = this.data.list.length;
    wx.request({
      url: app.host + '/product/getlist',
      method: 'GET',
      data: {
        collegeid: collegeid,
        skip: skip,
        order: 0,
      },
      success: (res) => {
        wx.stopPullDownRefresh(); //暂停刷新动作
        console.log(res.data);
        if (res.data.list.length == 0) {
          that.setData({
            nomore: true,
            list: [],
          });
          return false;
        }
        if (res.data.list.length < 20) {
          that.setData({
            nomore: true,
            page: 0,
            list: res.data.list,
          });

        } else {
          that.setData({
            page: 0,
            list: res.data.list,
            nomore: false,
          });

        }
      }
    })
  },
  more() {
    let that = this;
    if (that.data.nomore || that.data.list.length < 20) {
      return false
    }
    let page = that.data.page + 1;
    if (that.data.collegeCur == -2) {
      var collegeid = _.neq(-2); //除-2之外所有
    } else {
      var collegeid = that.data.collegeCur + '' //小程序搜索必须对应格式
    }
    db.collection('publish').where({
      status: 0,
      dura: _.gt(new Date().getTime()),
      collegeid: collegeid
    }).orderBy('creat', 'desc').skip(page * 20).limit(20).get({
      success: function (res) {
        if (res.data.list.length == 0) {
          that.setData({
            nomore: true
          })
          return false;
        }
        if (res.data.list.length < 20) {
          that.setData({
            nomore: true
          })
        }
        that.setData({
          page: page,
          list: that.data.list.concat(res.data.list)
        })
      },
      fail() {
        wx.showToast({
          title: '获取失败',
          icon: 'none'
        })
      }
    })
  },
  onReachBottom() {
    this.more();
  },
  //下拉刷新
  onPullDownRefresh() {
    this.getList();
  },
  gotop() {
    wx.pageScrollTo({
      scrollTop: 0
    })
  },
  //跳转详情
  detail(e) {
    let that = this;
    wx.navigateTo({
      url: '/pages/detail/detail?scene=' + e.currentTarget.dataset.id,
    })
  },
  //获取轮播
  // getbanner() {
  //   let that = this;
  //   let imageurl = ["http://renew-lhoss.oss-cn-shenzhen.aliyuncs.com/2be82a91-9f0f-40c6-b3ff-8d9509aa936e-kqH4pLUa6j3H5832b39f13ff897896dc4ec01913c5db.png?Expires=9223372036854775&OSSAccessKeyId=LTAI5tEeGnX2N23Xv9njeTeF&Signature=G%2F2SO0CF%2Bv%2BvVYw2R7iRJpnxPmY%3D", "http://renew-lhoss.oss-cn-shenzhen.aliyuncs.com/df893226-aeb2-4b36-9294-f25119471f81-Bzo1KACJnjW994e90b136f661fe4e820dd89d2466f1a.png?Expires=9223372036854775&OSSAccessKeyId=LTAI5tEeGnX2N23Xv9njeTeF&Signature=hkAz1H1e6UPDp2gD8Jv1HI0Psl0%3D"]
  //   that.setData({
  //     banner: imageurl
  //   })

  // },
  // //跳转轮播链接
  // goweb(e) {
  //   console.log(e.currentTarget.dataset.web)
  //   wx.navigateTo({
  //     url: '/pages/web/web?url=' + e.currentTarget.dataset.web,
  //   })
  // },
  onShareAppMessage() {
    return {
      title: JSON.parse(config.data).share_title,
      imageUrl: JSON.parse(config.data).share_img,
      path: '/pages/start/start'
    }
  },

  onShow() {
    this.getList(),
      this.getTip()
  },

  getTip() {
    let that = this
    // db.collection('Tip').where({}).get({
    //   success: function (res) {
    //     that.setData({
    //       indexTip: res.data[0].tip
    //     })
    //     console.log("zhelishixiaoxi" + res)
    //   },
    // })
  },
})
