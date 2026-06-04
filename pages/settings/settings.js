const app = getApp();
const api = require('../../utils/api');

Page({
  data: { userEmoji: '', userName: '' },

  onShow() {
    if (!app.globalData.userId) { wx.redirectTo({ url: '/pages/index/index' }); return; }
    const info = app.globalData.userInfo;
    if (info) this.setData({ userEmoji: info.user.emoji, userName: info.user.display_name });
  },

  switchUser() {
    wx.showModal({
      title: '切换用户', content: '确定要切换用户吗？',
      success: (res) => {
        if (!res.confirm) return;
        wx.removeStorageSync('mb_user');
        app.globalData.userId = '';
        app.globalData.userInfo = null;
        wx.reLaunch({ url: '/pages/index/index' });
      },
    });
  },

  resetData() {
    wx.showModal({
      title: '重置所有数据',
      content: '⚠️ 将清空所有打卡记录、兑换记录和动态，此操作不可撤销！',
      success: (res) => {
        if (!res.confirm) return;
        wx.showLoading({ title: '重置中...', mask: true });
        api.resetAll().then(() => {
          wx.hideLoading();
          wx.showToast({ title: '已重置', icon: 'success' });
          api.login(app.globalData.userId).then(data => {
            app.globalData.userInfo = data;
            this.onShow();
          });
        }).catch(err => {
          wx.hideLoading();
          wx.showToast({ title: err.message || '重置失败', icon: 'none' });
        });
      },
    });
  },
});
