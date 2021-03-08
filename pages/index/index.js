const util = require('../../utils/util.js');
const api = require('../../config/api.js');
const user = require('../../utils/user.js');

//获取应用实例
const app = getApp();

Page({
  data: {
    userInfo: {},
    hasLogin: false
  },
  onShow() {
    console.info('index on show', new Date());
    if (app.globalData.hasLogin) {
      const userInfo = wx.getStorageSync('userInfo');
      this.setData({
        userInfo: userInfo,
        hasLogin: true
      })
    } else {
      this.tryCodeLogin();
    }
  },
  tryCodeLogin() {
    user.login()
        .then(res => {
          const url = api.AutoLoginByCode + '?code=' + res.code;
          util.request(url)
              .then(res => {
                console.info('code login', res);
                const {token, userInfo} = res.data;
                wx.setStorageSync(app.commonKeys.STORAGE_TOKEN, token);
                wx.setStorageSync(app.commonKeys.STORAGE_USER_INFO, userInfo);
                app.globalData.hasLogin = true;
                this.setData({
                  userInfo: userInfo,
                  hasLogin: true
                })
              })
              .catch(err => {
                app.globalData.hasLogin = false;
                wx.setStorageSync(app.commonKeys.LAST_REDIRECT_URL, '/pages/index/index');
                wx.navigateTo({
                  url: '/pages/auth/accountLogin/accountLogin'
                })
              })
        })
        .catch(errMsg => {
        
        })
  }
});