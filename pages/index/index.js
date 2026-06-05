const app = getApp();
const api = require('../../utils/api');

const MOTTOS = [
  '坚持就是胜利 💪', '今天的努力是明天的礼物 🎁',
  '每一天都值得认真对待 ✨', '变好的路上，你并不孤单 🌸',
  '小小的坚持，大大的改变 🌱',
];

Page({
  data: { dateStr: '', motto: '', loading: false, code: '', codeVerified: false, verifying: false },

  onLoad() {
    const storedCode = wx.getStorageSync('mb_code');
    if (app.globalData.userId && storedCode) {
      wx.switchTab({ url: '/pages/checkin/checkin' });
      return;
    }
    this._initWelcome();
    // 有存储的码则直接进入选人步骤
    if (storedCode) {
      this.setData({ code: storedCode, codeVerified: true });
    }
  },

  _initWelcome() {
    const now = new Date();
    const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    this.setData({
      dateStr: `${months[now.getMonth()]}${now.getDate()}日 ${weekDays[now.getDay()]}`,
      motto: MOTTOS[now.getDate() % MOTTOS.length],
    });
  },

  onCodeInput(e) {
    this.setData({ code: e.detail.value });
  },

  verifyCode() {
    const code = this.data.code.trim();
    if (!code) { wx.showToast({ title: '请输入访问码', icon: 'none' }); return; }
    if (this.data.verifying) return;
    this.setData({ verifying: true });

    // 用任意 user_id 验证访问码是否正确
    api.login('me', code)
      .then(() => {
        wx.setStorageSync('mb_code', code);
        this.setData({ codeVerified: true, verifying: false });
      })
      .catch(err => {
        this.setData({ verifying: false });
        wx.showToast({ title: err.message || '访问码错误', icon: 'none', duration: 2000 });
      });
  },

  selectUser(e) {
    const userId = e.currentTarget.dataset.user;
    const code = wx.getStorageSync('mb_code') || this.data.code;
    if (this.data.loading) return;
    this.setData({ loading: true });

    wx.setStorageSync('mb_user', userId);
    app.globalData.userId = userId;
    wx.showLoading({ title: '登录中...', mask: true });

    api.login(userId, code)
      .then(data => {
        app.globalData.userInfo = data;
        wx.hideLoading();
        wx.switchTab({ url: '/pages/checkin/checkin' });
      })
      .catch(err => {
        wx.hideLoading();
        this.setData({ loading: false });
        wx.showToast({ title: err.message || '连接服务器失败', icon: 'none', duration: 2500 });
      });
  },
});
