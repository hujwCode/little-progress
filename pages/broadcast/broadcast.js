const app = getApp();
const api = require('../../utils/api');
const util = require('../../utils/util');

Page({
  data: {
    loading: true, error: false, broadcasts: [],
    userEmoji: '', inputValue: '', sending: false,
  },

  onShow() {
    if (!app.globalData.userId) { wx.redirectTo({ url: '/pages/index/index' }); return; }
    const info = app.globalData.userInfo;
    if (info) this.setData({ userEmoji: info.user.emoji });
    this.loadData();
  },

  loadData() {
    this.setData({ loading: true, error: false });
    api.getBroadcasts()
      .then(b => {
        const items = (b || []).map(item => Object.assign({}, item, {
          _timeAgo: util.timeAgo(item.created_at),
        }));
        this.setData({ loading: false, broadcasts: items });
      })
      .catch(() => this.setData({ loading: false, error: true }));
  },

  onInput(e) { this.setData({ inputValue: e.detail.value }); },

  sendMessage() {
    const c = this.data.inputValue.trim();
    if (!c || this.data.sending) return;
    this.setData({ sending: true });
    api.sendBroadcast(app.globalData.userId, c)
      .then(() => { this.setData({ inputValue: '', sending: false }); this.loadData(); })
      .catch(err => { this.setData({ sending: false }); util.showToast(err.message || '发送失败'); });
  },
});
