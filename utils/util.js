var api = require('../config/api.js');
var app = getApp();

function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()
  
  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()
  
  
  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

/**
 * 封封微信的的request
 */
function request(url, data = {}, method = "GET") {
  return new Promise(function (resolve, reject) {
    wx.request({
      url: url,
      data: data,
      method: method,
      header: {
        'Content-Type': 'application/json',
        'Authorization': wx.getStorageSync('token')
      },
      success: function (res) {
        if (res.statusCode === 200) {
          const {code} = res.data;
          if (code === 501) {
            // 清除登录相关内容
            try {
              wx.removeStorageSync('userInfo');
              wx.removeStorageSync('token');
            } catch (e) {
              // Do something when catch error
            }
            // 切换到登录页面
            wx.navigateTo({
              url: '/pages/auth/login/login'
            });
          } else if (code === 500) {
            reject(res.data.message || '后台异常')
          } else if (code === 200) {
            resolve(res.data);
          } else {
            reject(res.data);
          }
        } else {
          reject(res.errMsg);
        }
        
      },
      fail: function (err) {
        reject(err)
      }
    })
  });
}

const whiteList = [];

function redirect(url) {
  
  //判断页面是否需要登录
  if (!whiteList.includes(url)) {
    wx.redirectTo({
      url: url
    });
    return false;
  } else {
    wx.redirectTo({
      url: url
    });
  }
}

function showErrorToast(msg) {
  wx.showModal({
    title: '错误信息',
    content: msg,
    showCancel: false
  });
}

module.exports = {
  formatTime,
  request,
  redirect,
  showErrorToast
};