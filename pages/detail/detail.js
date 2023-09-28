const app = getApp()
const db = wx.cloud.database();
const config = require("../../config.js");
// const _ = db.command;
let obj = ''
Page({

  /**
   * 页面的初始数据
   */
  data: {
    first_title: true,
    place: '',
    roomID: '',
    goodssaller: '',
    openid: '',
    imgs: [],
    isShow: true,
    status: 0,
    avatarUrl: '',
    buyerInfo: [],
    isExist: Boolean,
    address: ''
  },
  onLoad(e) {
    obj = e;
    // this.getuserdetail();
    this.data.id = e.scene;
    this.getPublish(e.scene);
    if (app.openid) {
      this.setData({
        openid: app.openid
      })
    } else {
      console.log("no openid");
      wx.showModal({
        title: '温馨提示',
        content: '该功能需要注册方可使用，是否马上去注册',
        success(res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/login/login',
            })
          }
        }
      })
      return false
    }
    this.getBuyer(this.data.openid)
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
  },

  //获取买家信息
  getBuyer(m) {
    let that = this;
    // db.collection('user').where({
    //       _openid: m
    // }).get({
    wx.request({
      url: app.host + '/user/getlist',
      method: 'GET',
      data: {
        openid: m,
      },
      success: function (res) {
        wx.hideLoading();
        that.setData({
          buyerInfo: res.data.list[0],
        })
      }
    })
  },

  goo(e) {
    var myid = this.data.openid;
    var sallerid = this.data.goodssaller;
    // wx.cloud.init({
    //   env: 'xin-dev2023-3gke13qm4291def7',
    //   traceUser: true
    // });
    //初始化数据库

    //避免自娱自乐[跟自己聊天]
    if (myid != sallerid) {
      
      wx.request({
        url: app.host + '/chatRooms/add',
        method: 'GET',
        data: {
          uid1: myid,
          uid2: sallerid,
        },
        success: (res) => {
          console.log(res.data);
          if (res.data.length > 0) {
            console.log("xxx")
            //TODO 判断res.data[0]._id是否为空
            this.setData({
              roomID: res.data[0]._id
            })
            wx.navigateTo({
              url: 'room/room?id=' + this.data.roomID,
            })
          } else {
            console.log("xxxyyy")
            wx.request({
              url: app.host + '/chatRooms/add',
              method: 'GET',
              data: {
                uid1: myid,
                uid2: sallerid,
              },
              success: (res) => {
                console.log(res)
                this.setData({
                  roomID: res._id
                })
                wx.navigateTo({
                  url: 'room/room?id=' + this.data.roomID,
                })
              }
            })
          }
        }
      })
    } else {
      wx.showToast({
        title: '无法和自己建立聊天',
        icon: 'none',
        duration: 1500
      })
    }
  },

  //地址输入
  placeInput(e) {
    this.data.place = e.detail.value
  },

  changeTitle(e) {
    let that = this;
    that.setData({
      first_title: e.currentTarget.dataset.id
    })
  },
  //获取发布信息
  getPublish(e) {
    let that = this;
    // db.collection('publish').doc(e).get({
    wx.request({
      url: app.host + '/product/getlist',
      method: 'GET',
      data: {
        skip: 0,
        pid: e,
        order: 2,
      },
      success: function (res) {
        that.setData({
          collegeName: JSON.parse(config.data).college[parseInt(res.data.collegeid) + 1],
          publishinfo: res.data.list[0],
        })
        that.getSeller(res.data._openid)
      }
    })
  },
  //获取卖家信息
  getSeller(e) {
    let that = this;
   // var sallerid = this.data.goodssaller;
    // var myid = this.data.openid;
    var sallerid = this.data.publishinfo._openid;
    wx.request({
      url: app.host + '/user/getlist',
      method: 'GET',
      data: {
          openid: sallerid,
      },
      success: function (res) {
        console.log("获取卖家信息");
        console.log(res.data.list[0]._openid);
        that.setData({
          //此处以修改
          userinfo: res.data.list[0],
          goodssaller: res.data.list[0]._openid
        })
        //  that.getBook(n)
      }
    })
  },
  //回到首页
  home() {
    wx.switchTab({
      url: '/pages/index/index',
    })
  },
  //回到我的
  my() {
    wx.switchTab({
      url: '/pages/my/my',
    })
  },
  //购买检测
  buy() {
    var myid = this.data.openid;
    var sallerid = this.data.goodssaller;
    let that = this;
    if (myid == sallerid) {
      wx.showToast({
        title: '自己买不了自己的噢！',
        icon: 'none',
        duration: 1500
      })
      return false
    }
    if (!app.openid) {
      wx.showModal({
        title: '温馨提示',
        content: '该功能需要注册方可使用，是否马上去注册',
        success(res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/login/login',
            })
          }
        }
      })
      return false
    }
    if (that.data.publishinfo.deliveryid == 1) {
      if (that.data.place == '') {
        wx.hideLoading();
        wx.showToast({
          title: '请输入您的收货地址',
          icon: 'none'
        })
        return false
      }
    }
    that.getStatus();
  },
  //获取订单状态
  getStatus() {
    let that = this;
    let _id = that.data.publishinfo._id;

    wx.request({
      url: app.host + '/product/getstatus',
      method: 'GET',
      data: {
        _id: _id,
      },
      success(e) {
        //下面e.data.status全写成e.data
        if (e.data == 0) {

          that.creatOrder(_id);
        }
        if (e.data == 1 || e.data == 5) {
          wx.showToast({
            title: '该物品刚刚被抢光了~',
            icon: 'none'
          })
        }
        if (e.data == 2) {
          //  console.log("该物品已出售");
          wx.showToast({
            title: '该物品已出售',
            icon: 'none'
          })
        }
        if (e.data == 3) {
          // console.log("该物品已下架");
          wx.showToast({
            title: '该物品已下架',
            icon: 'none'
          })
        }
      }
    })
  },
  //创建订单 判断是否存在该订单
  creatOrder(iid) {
    let that = this;
    console.log("创建订单...");
    // db.collection('order').where({
    //       _id: iid
    // }).get().then(res => {
    wx.request({
      url: app.host + '/order/getlist',
      method: 'GET',
      data: {
        _id: iid,
      },
      success(res) {
        console.log(res.data);
        if (res.data.length > 0) {
          that.setData({
            isExist: true
          })
          console.log("isExist:" + that.data.isExist)
        } else {
          that.setData({
            isExist: false
          })
          console.log("isExist:" + that.data.isExist)
        }
      },
    })

    wx.showModal({
      title: '确认提示',
      content: '是否确认下单购买此商品？',
      success(res) {
        if (res.confirm) {
          console.log("下单" + res.confirm)
          if (!that.data.isExist) {
            //调用云函数 好像只是更改商品publish状态?
            wx.getUserInfo({
              success: function (res) {
                that.setData({
                  buyerName: res.userInfo.nickName,
                  avatarUrl: res.userInfo.avatarUrl,
                })
              },
              fail() {
                console.log("调用getUserinfo失败")
              }
            })

            //TODO 创建失败时应回滚事务 让后端调用此请求[方法]
            wx.request({
              url: app.host + '/product/setstatus',
              method: 'GET',
              data: {
                _id: iid,
                status: 1,
              },
              success() {
                wx.hideLoading();

                wx.request({
                  url: app.host + '/order/add',
                  method: 'GET',

                  data: {
                    //通过商品id取得商品信息
                    _id: iid,
                    //通过卖家id取得信息 获取商品信息的同时也可以获取到卖家id
                    //通过买家openid取得信息 token也可以取出当前用户id 可以拿来进行比对
                    openid: app.openid,
                    palce: that.data.place, //帮送时买家的地址
                  },
                  success() {
                    that.getAddress()
                    that.send(that.data.goodssaller)
                    wx.showToast({
                      title: '成功预订！',
                      icon: 'success',
                      duration: 3000
                    })
                    setTimeout(function () {
                      wx.switchTab({
                        url: '/pages/index/index',
                      })
                    }, 3000)
                  },
                  fail() {
                    wx.hideLoading();
                    wx.showToast({
                      title: '发生异常，请及时和管理人员联系处理',
                      icon: 'none'
                    })
                  }
                })
              },
              fail() {
                wx.hideLoading();
                wx.showToast({
                  title: '操作失败',
                  icon: 'none'
                })
              }
            })
            that.onLoad(obj);
          } else {

            that.onLoad(obj);
          }
        }
      }
    })

  },

  //发送模板消息到指定用户,推送之前要先获取用户的openid
  send(openid) {
    let that = this;
    wx.cloud.callFunction({
      name: "sendMsg",
      data: {
        openid: openid,
        status: '买家已预定', //0在售；1买家已付款，但卖家未发货；2买家确认收获，交易完成；
        address: that.data.address,
        describe: that.data.publishinfo.bookinfo.describe,
        good: that.data.publishinfo.bookinfo.good,
        nickName: that.data.buyerInfo.info.nickName,
        color: 'red'
      }
    }).then(res => {
      console.log("推送消息成功", res)
    }).catch(res => {
      console.log("推送消息失败", res)
    })
  },

  //路由
  go(e) {
    wx.navigateTo({
      url: e.currentTarget.dataset.go,
    })
  },
  
  //为了数据安全可靠，每次进入获取一次用户信息
  getuserdetail() {
    if (!app.openid) {
      wx.cloud.callFunction({
        name: 'regist', // 对应云函数名
        data: {
          $url: "getid", //云函数路由参数
        },
        success: re => {
        }
      })
    }
  },

  //图片点击事件
  img: function (event) {
    let arr = [];
    console.log(this.data.publishinfo.bookinfo.imgs)
    arr.push(this.data.publishinfo.bookinfo.imgs);
    const arr1 = arr[0].filter(item => typeof item === 'string' && item.trim() !== "");
    console.log(arr1)
    var src = event.currentTarget.dataset.src; //获取data-src
    // var imgList = that.data.result.images_fileID;
    //图片预览
    wx.previewImage({
      current: src, // 当前显示图片的http链接
      urls: arr1 // 需要预览的图片http链接列表
    })
  },

  /**
   * 获取地址
   */
  getAddress() {
    let that = this;
    if (that.data.publishinfo.deliveryid == 0) {
      that.setData({
        address: that.data.publishinfo.place
      })
    } else {
      that.setData({
        address: that.data.place
      })
    }
  },
})