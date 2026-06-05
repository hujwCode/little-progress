// ✨ 小进步 - 微信小程序版
App({
  globalData: {
    // 修改为你的服务器地址（开发环境可用局域网IP，生产环境用域名）
    API_BASE: 'http://43.153.155.195:80',
    userInfo: null,
    userId: '',
  },

  onLaunch() {
    const userId = wx.getStorageSync('mb_user');
    if (userId) {
      this.globalData.userId = userId;
    }
  },
});
