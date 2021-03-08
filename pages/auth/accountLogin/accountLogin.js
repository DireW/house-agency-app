var api = require('../../../config/api.js');
var util = require('../../../utils/util.js');
var user = require('../../../utils/user.js');

var app = getApp();
Page({
  data: {
    username: '',
    password: '',
    code: '',
    loginErrorCount: 0
  },
  wechatUser: {},
  onShow() {
    this.wechatUser = {};
  },
  wxLogin(e) {
    if (!this.checkFormAvailable()) return;
    if (e.detail.userInfo === undefined) {
      app.globalData.hasLogin = false;
      util.showErrorToast('微信登录失败');
      return;
    }
    user.login()
        .then(res => {
          this.wechatUser = {
            code: res.code,
            ...e.detail.userInfo
          };
          this.loginWithWechatUser();
        })
        .catch(err => {
        
        })
  },
  loginWithWechatUser() {
    const requestData = {
      username: this.data.username,
      password: this.data.password,
      ...this.wechatUser
    };
    util.request(api.AuthLoginWithWechat, requestData, 'POST')
        .then(res => {
          this.loginSuccess(res.data);
        })
        .catch(err => {
          util.showErrorToast(err);
        })
  },
  checkFormAvailable() {
    if (this.data.password.length < 1 || this.data.username.length < 1) {
      util.showErrorToast('请输入用户名和密码');
      return false;
    }
    return true;
  },
  accountLogin: function() {
    if (!this.checkFormAvailable()) return;
    const requestData = {
      username: this.data.username,
      password: this.data.password
    };
    util.request(api.AuthLoginByAccount, requestData, 'POST')
        .then(res => {
          this.loginSuccess(res.data);
        })
        .catch(err => {
          util.showErrorToast(err);
        });
  },
  loginSuccess(responseData) {
    const {token,userInfo} = responseData;
    //存储用户信息
    wx.setStorageSync(app.commonKeys.STORAGE_USER_INFO, userInfo);
    wx.setStorageSync(app.commonKeys.STORAGE_TOKEN, token);
    app.globalData.hasLogin = true;
    // 获取应该回到的页面
    const url = wx.getStorageSync(app.commonKeys.LAST_REDIRECT_URL);
    wx.switchTab({
      url
    })
  },
  bindUsernameInput: function(e) {
    this.setData({
      username: e.detail.value
    });
  },
  bindPasswordInput: function(e) {
    this.setData({
      password: e.detail.value
    });
  },
  bindCodeInput: function(e) {
    this.setData({
      code: e.detail.value
    });
  },
  clearInput: function(e) {
    switch (e.currentTarget.id) {
      case 'clear-username':
        this.setData({
          username: ''
        });
        break;
      case 'clear-password':
        this.setData({
          password: ''
        });
        break;
      case 'clear-code':
        this.setData({
          code: ''
        });
        break;
    }
  }
});