const app = getApp();
const api = require('../../utils/api');
const util = require('../../utils/util');

Page({
  data: {
    loading: true, error: false,
    availablePoints: 0, totalPoints: 0,
    weekly: null, rewards: [], redemptionHistory: [],
  },

  onShow() {
    if (!app.globalData.userId) { wx.redirectTo({ url: '/pages/index/index' }); return; }
    this.loadData();
  },

  loadData() {
    const uid = app.globalData.userId;
    this.setData({ loading: true, error: false });

    Promise.all([
      api.getPoints(uid),
      api.getRedemptionHistory(uid),
    ]).then(([pts, history]) => {
      const rewards = (pts.rewards || []).map(r => Object.assign({}, r, {
        _tierLabel: util.getTierLabel(r.threshold),
      }));
      const hist = (history || []).map(h => Object.assign({}, h, {
        _timeAgo: util.timeAgo(h.redeemed_at),
      }));
      this.setData({
        loading: false,
        availablePoints: pts.available,
        totalPoints: pts.total_raw,
        weekly: pts.weekly || null,
        rewards,
        redemptionHistory: hist,
      });
    }).catch(() => this.setData({ loading: false, error: true }));
  },

  claimReward(e) {
    const id = e.currentTarget.dataset.id;
    const r = this.data.rewards.find(x => x.id === id);
    if (!r) return;
    wx.showModal({
      title: '确认兑换',
      content: `确定要兑换「${r.label}」(${r.threshold} 分)吗？`,
      success: (res) => {
        if (!res.confirm) return;
        wx.showLoading({ title: '兑换中...', mask: true });
        api.claimReward(app.globalData.userId, id)
          .then(() => {
            wx.hideLoading();
            wx.showToast({ title: '兑换成功 🎉', icon: 'success' });
            this.loadData();
          })
          .catch(err => {
            wx.hideLoading();
            wx.showToast({ title: err.message || '兑换失败', icon: 'none' });
          });
      },
    });
  },
});
