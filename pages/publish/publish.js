const db = wx.cloud.database();
const app = getApp();
const config = require("../../config.js");
const MAX_IMG_NUM = 8;
// const aliyunFileKey = new Date().getTime() + Math.floor(Math.random() * 150) + '.png';
// 发布商品模块
Page({
  data: {
    isExist: '',
    price: 10.01,
    inputPrice: '',
    selectPhoto: true,
    systeminfo: app.systeminfo,
    params: {
      imgUrl: new Array(),
    },
    tempFilePaths: [],
    entime: {
      enter: 600,
      leave: 300
    }, //进入褪出动画时长
    college: JSON.parse(config.data).college.splice(1),
    steps: [{
        text: '步骤一',
        desc: '补充物品信息'
      },
      {
        text: '步骤二',
        desc: '发布成功',
      },
    ],
  },
  //恢复初始态
  initial() {
    let that = this;
    that.setData({
      dura: 30,
      inputPrice:'10.00',
      place: '',
      chooseDelivery: 0,
      cids: '-1', //类别选择的默认值
      show_b: true,
      show_c: false,
      active: 0,
      chooseCollege: false,
      note_counts: 0,
      desc_counts: 0,
      notes: '',
      describe: '',
      good: '',
      kindid: 0,
      showorhide: true,
      tempFilePaths: [],
      params: {
        imgUrl: new Array(),
      },
      imgUrl: [],
      kind: [{
        name: '通用',
        id: 0,
        check: true,
      }, {
        name: '用途',
        id: 1,
        check: false
      }],
      delivery: [{
        name: '自提',
        id: 0,
        check: true,
      }, {
        name: '帮送',
        id: 1,
        check: false
      }],
      selectPhoto: true
    })
  },
  onLoad() {
    this.initial();
    // this.getCodeFromSet();
  },
  onShow() {
    // this.initial();
  },
  //价格输入改变
  priceChange: function (e) {
    const inputPrice = parseFloat( e.detail.value )// 尝试解析输入的值为浮点数
    console.log(inputPrice)
    
      const price = inputPrice.toFixed(2); // 保留两位小数
      this.setData({
        price: price,
      });
      console.log(price)

  },
  //检验价格是否为2位小数
  

  //时长才输入改变
  duraChange(e) {
    this.data.dura = e.detail;
  },
  //地址输入
  placeInput(e) {
    this.data.place = e.detail.value
  },
  //物品输入
  goodInput(e) {
    this.data.good = e.detail.value
  },
  //类别选择
  kindChange(e) {
    let that = this;
    let kind = that.data.kind;
    let id = e.detail.value;
    for (let i = 0; i < kind.length; i++) {
      kind[i].check = false
    }
    kind[id].check = true;
    if (id == 1) {
      that.setData({
        kind: kind,
        chooseCollege: true,
        kindid: id
      })
    } else {
      that.setData({
        kind: kind,
        cids: '-1',
        chooseCollege: false,
        kindid: id
      })
    }
  },
  //选择专业
  choCollege(e) {
    let that = this;
    console.log(e.detail.value)
    that.setData({
      cids: e.detail.value
    })
  },
  //取货方式改变
  delChange(e) {
    let that = this;
    let delivery = that.data.delivery;
    let id = e.detail.value;
    for (let i = 0; i < delivery.length; i++) {
      delivery[i].check = false
    }
    delivery[id].check = true;
    if (id == 1) {
      that.setData({
        delivery: delivery,
        chooseDelivery: 1
      })
    } else {
      that.setData({
        delivery: delivery,
        chooseDelivery: 0
      })
    }
  },
  //输入备注
  noteInput(e) {
    let that = this;
    that.setData({
      note_counts: e.detail.cursor,
      notes: e.detail.value,
    })
  },
  //输入描述
  describeInput(e) {
    let that = this;
    that.setData({
      desc_counts: e.detail.cursor,
      describe: e.detail.value,
    })
  },
  //发布校检
  check_pub() {
    let that = this;
    //如果用户选择了用途，需要选择用途类别
    if (that.data.kind[1].check) {
      if (that.data.cids == -1) {
        wx.showToast({
          title: '请选择用途',
          icon: 'none',
        });
        return false;
      }
    }
    //如果用户选择了自提，需要填入详细地址
    if (that.data.delivery[0].check) {
      if (that.data.place == '') {
        wx.showToast({
          title: '请输入地址',
          icon: 'none',
        });
        return false;
      }
    }
    //检测发布时间是否有小数
    const checkdura = this.data.dura
    if(checkdura%1!=0){
      wx.showToast({
        title: "发布时间不能包含小数",
        icon: 'none',
      })
      return
    }
    that.publish();
  },
  //正式发布
  publish() {
    let that = this;
     // 将价格转换为整数（乘以100）
    const priceInCents = parseFloat(that.data.price) * 100;
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

    if (that.data.good == '') {
      wx.showToast({
        title: '请输入商品名称',
        icon: 'none',
      });
      return false;
    }
    if (that.data.describe == '') {
      wx.showToast({
        title: '请输入商品的详细描述',
        icon: 'none',
      });
      return false;
    }

    if (that.data.imgUrl == '') {
      wx.showToast({
        title: '请选择图片',
        icon: 'none',
      });
      return false;
    }
    if (that.data.notes == '') {
      wx.showToast({
        title: '请输入相关的备注信息（如取货时间，新旧程度等）',
        icon: 'none',
      });
      return false;
    }

    wx.showModal({
      title: '温馨提示',
      content: '经检测您填写的信息无误，是否马上发布？',
      success(res) {
        if (res.confirm) {
          var value = wx.getStorageSync('token')
          wx.request({
            header: {
              'Authorization': value,
            },
            url: app.host + '/product/add',
            method: 'POST',
            data: {
              //发布时长
              // dura: new Date().getTime() + that.data.dura * (24 * 60 * 60 * 1000),
              // status: 0, //0在售；1买家已付款，但卖家未发货；2买家确认收获，交易完成；3、交易作废，退还买家钱款
              name: that.data.good,
              prices: priceInCents, // 售价将以分为单位的价格发送到服务器
              //分类
              kindid: that.data.kindid, //区别通用还是用途
              collegeid: that.data.cids, //学院id，-1表示通用类
              deliveryid: that.data.chooseDelivery, //0自1配
              place: that.data.place, //选择自提时地址
              notes: that.data.notes, //备注  
              description: that.data.describe,
              //6 只能以文本的方式传输了
              pictures: JSON.stringify(that.data.imgUrl),

            },
            success(e) {
              console.log(e)

              var resdata = e.data
                //判断是否成功 1成功 0失败
               if(resdata.code == 0){
                 //发布失败
                 wx.showToast({
                  title: '发布失败,请检查资料是否填写完整',
                  icon: 'none',
                  duration: 1000
                })
               }else{
              that.setData({
                show_b: false,
                show_c: true,
                active: 2,
                detail_id: e._id
              });
              wx.showToast({
                title: '正在上传...',
                icon: 'loading',
                mask: true,
                duration: 1000
              })
              setTimeout(function () {
                //判断卖家是否已经上传了赞赏码
                wx.request({
                  url: app.host + '/oss/eqImage',
                  method: 'GET',
                  data: {
                    opid: app.openid,
                  },
                  success: function (res) {
                    
                  },
                  error: function(){
                      wx.showModal({
                        title: '商品发布成功',
                        content: '您未上传赞赏码用于交易，是否现在去上传？',
                        showCancel: true, //是否显示取消按钮
                        cancelText: "稍后再传", //默认是“取消”
                        cancelColor: '#fbbd08', //取消文字的颜色
                        success(res) {
                          if (res.confirm) {
                            wx.navigateTo({
                              url: '/pages/appreciateCode/appreciateCode',
                            })
                          }
                        }
                      })
                  }
                })
                
              }, 2000)

              that.setData({
                show_b: false,
                show_c: true,
                active: 2,
                detail_id: e._id,
              });
              //滚动到顶部
              wx.pageScrollTo({
                scrollTop: 0,
              })
            }
          }
          })
        }
      }
    })
  },
  //获取赞赏码
  getCodeFromSet() {
    let that = this;
    let openid = app.openid
    console.log(openid)
    db.collection('appreciatecode').where({
      _openid: openid,
    }).get().then(res => {
      if (res.data.length > 0) {
        that.setData({
          isExist: true,
          bigImg: res.data[0].bigImg
        })
        console.log(res.data[0].bigImg)
        console.log("isExist---->" + that.data.isExist)
      } else {
        that.setData({
          isExist: false,
        })
        console.log("isExist---->" + that.data.isExist)
      }
    })
  },

  doUpload(filePath) {
    console.log("图片路径: " + filePath);
    const that = this;
    {
    /*
    wx.uploadFile({
      url: app.host + '/oss/upload',
      filePath: filePath,
      name: 'file',
      formData: {
        'user': 'test'
      },
      success: function(res) {
        var data = res.data;
        console.log(data)
        const {
          params
        } = that.data;
        const {
          imgUrl
        } = params;
        imgUrl.push(data);
        params['imgUrl'] = imgUrl;
        that.setData({
          imgUrl,
        });
      },
      fail: function(res) {
        console.log('上传失败', res);
      }
    })
    */
  }
   //文件名
   var imgName = new Date().getTime() + Math.floor(Math.random() * 150) + '.png';
   wx.request({
     url: app.host + "/oss/policy",
     method: 'GET',
     success: (policydata) => {
       if (policydata) {
         //console.log(policy.data.data);
           //OSS
           wx.uploadFile({
             //url: policydata.data.data.host, // 开发者服务器的URL。 --ok
             url: policydata.data.data.host, // 开发者服务器的URL。 --ok
             filePath: filePath,  // --ok
             name: 'file', // 必须填file。
             formData: {
               key : imgName,
               policy : policydata.data.data.policy,
               OSSAccessKeyId : policydata.data.data.ossAccessKeyId,
               signature : policydata.data.data.signature,
               // 'x-oss-security-token': securityToken // 使用STS签名时必传。
             },
             success: (res) => {
               console.log(policydata.data.data.policy);
               console.log(res);
               //TODO 取得图片名???
               if (res.statusCode === 204) {
                 const {
                               params
                         } = that.data;
                         const {
                               imgUrl
                         } = params;
                         // imgUrl.push(res.fileID);
                         imgUrl.push(imgName);
                          params['imgUrl'] = imgUrl;
                         that.setData({
                               imgUrl,
                         });
                 console.log('上传成功');
               }
             },
             fail: err => {
               console.log(err);
               console.log('上传失败');
             }
           });
       }
     },
     fail() {
       console.error('[上传文件] 失败：', error);
             wx.showToast({
                   icon: 'none',
                   title: '上传失败',
                   duration: 1000
             })
 },
 })


  },
 
  chooseImage: function () {
    const that = this;
    // 还能再选几张图片,初始值设置最大的数量-当前的图片的长度
    let max = MAX_IMG_NUM - this.data.tempFilePaths.length;
    // 选择图片
    wx.chooseImage({
      count: max, // count表示最多可以选择的图片张数
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const filePath = res.tempFilePaths;
        //将选择的图片上传
        filePath.forEach((path, _index) => {
          setTimeout(() => that.doUpload(path), _index); //加不同的延迟，避免多图上传时文件名相同
        });
        const {
          tempFilePaths
        } = that.data;
        that.setData({
          tempFilePaths: tempFilePaths.concat(filePath)
        }, () => {
          console.log(that.data.tempFilePaths)
        })
        // 还能再选几张图片
        max = MAX_IMG_NUM - this.data.tempFilePaths.length
        this.setData({
          selectPhoto: max <= 0 ? false : true // 当超过8张时,加号隐藏
        })
      },
      fail: e => {
        console.error(e)
      }
    })
  },
  deletePic(e) {
    console.log(e);
    let index = e.currentTarget.dataset.index
    let imgUrl = this.data.params.imgUrl
    const {
      tempFilePaths
    } = this.data;
    tempFilePaths.splice(index, 1);
    imgUrl.splice(index, 1)
    this.setData({
      ['params.imgUrl']: imgUrl,
      tempFilePaths,
    })
    // 当添加的图片达到设置最大的数量时,添加按钮隐藏,不让新添加图片
    if (this.data.tempFilePaths.length == MAX_IMG_NUM - 1) {
      this.setData({
        selectPhoto: true,
      })
    }
  },
  detail() {
    let that = this;
    wx.navigateTo({
      url: '/pages/detail/detail?scene=' + that.data.detail_id,
    })
  }
})