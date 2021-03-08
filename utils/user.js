/**
 * 用户相关服务
 */
const util = require('../utils/util.js');
const api = require('../config/api.js');
const app = getApp();

/**
 * Promise封装wx.checkSession
 */
function checkSession() {
  return new Promise(function (resolve, reject) {
    wx.checkSession({
      success: function () {
        resolve();
      },
      fail: function () {
        reject();
      }
    });
  });
}

/**
 * Promise封装wx.login
 */
function login() {
  return new Promise(function (resolve, reject) {
    wx.login({
      success: function (res) {
        if (res.code) {
          resolve(res);
        } else {
          reject(res);
        }
      },
      fail: function (err) {
        reject(err);
      }
    });
  });
}

/**
 * 根据code获取openid之后尝试登陆
 */
function loginByCode() {
  return new Promise((resolve, reject) => {
  
  })
}

/**
 * 调用微信登录
 */
function loginByWeixin(userInfo) {
  return new Promise(function (resolve, reject) {
    return login()
        .then((res) => {
          //登录远程服务器
          const requestData = {
            code: res.code,
            userInfo: userInfo
          };
          util.request(api.AuthLoginWithWechat, requestData, 'POST')
              .then(res => {
                if (res.errno === 0) {
                  //存储用户信息
                  wx.setStorageSync('userInfo', res.data.userInfo);
                  wx.setStorageSync('token', res.data.token);
                  
                  resolve(res);
                } else {
                  reject(res);
                }
              })
              .catch((err) => {
                reject(err);
              });
        })
        .catch((err) => {
          reject(err);
        })
  });
}

/**
 * 账号登录，可能会携带微信用户信息
 * @param data
 */
function loginByAccount(data) {
  return new Promise((resolve, reject) => {
    util.request(api.AuthLoginByAccount, data, 'POST')
        .then(res => {
          //存储用户信息
          wx.setStorageSync('userInfo', res.data.userInfo);
          wx.setStorageSync('token', res.data.token);
          resolve(res);
        })
        .catch(err => {
          // 后台session中没有绑定openid，需要重新获取
          
        });
  })
  
}

/**
 * 判断用户是否登录
 */
function checkLogin() {
  return new Promise(function (resolve, reject) {
    if (wx.getStorageSync('userInfo') && wx.getStorageSync('token')) {
      checkSession().then(() => {
        resolve(true);
      }).catch(() => {
        reject(false);
      });
    } else {
      reject(false);
    }
  });
}

module.exports = {
  loginByWeixin,
  loginByAccount,
  loginByCode,
  checkSession,
  checkLogin,
  login,
};