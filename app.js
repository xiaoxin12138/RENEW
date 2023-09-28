const config = require("config.js");

App({
  openid: '',
  userinfo: '',
  // host:'https://192.168.1.71:8090',
  // host:'https://47.106.229.88:8090', 
   host: 'https://www.renew880.com:8090',
  // host:'https://localhost:8090',
  roomlist: [],
  canReflect: true,
  initList: [],
  getinitListdata: [],
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: JSON.parse(config.data).env,
        traceUser: true,
      })
    }
    this.systeminfo = wx.getSystemInfoSync();

  }
})