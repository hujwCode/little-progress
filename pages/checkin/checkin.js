const app = getApp();
const api = require('../../utils/api');
const util = require('../../utils/util');

Page({
  data: {
    user: null, habits: [], todayRecords: {},
    headerEmoji: '', headerName: '', availablePoints: 0,
    dayPoints: 0, maxDayPoints: 0,
    broadcasts: [], broadcastIdx: 0, hasBroadcasts: false,
    curBroadcast: null,
    loading: true, error: false,
    celebrate: false, celebrateItems: [],
  },

  onShow() {
    if (!app.globalData.userId) { wx.redirectTo({ url: '/pages/index/index' }); return; }
    this._isActive = true;
    this.loadData();
  },

  onUnload() {
    this._isActive = false;
    this._clearTicker();
  },

  loadData() {
    const uid = app.globalData.userId;
    const code = wx.getStorageSync('mb_code') || '';
    this.setData({ loading: true, error: false });

    Promise.all([
      api.login(uid, code), api.getPoints(uid), api.getBroadcasts(),
    ]).then(([loginData, pts, bcasts]) => {
      const recs = loginData.today_records || {};
      app.globalData.userInfo = loginData;
      this.setData({
        user: loginData.user, habits: loginData.habits,
        todayRecords: recs, availablePoints: pts.available,
        dayPoints: util.calcDayPoints(loginData.habits, recs),
        maxDayPoints: util.calcMaxDayPoints(loginData.habits),
        headerEmoji: loginData.user.emoji, headerName: loginData.user.display_name,
        broadcasts: bcasts || [],
        hasBroadcasts: bcasts && bcasts.length > 0,
        broadcastIdx: 0, loading: false,
      });
      this._updateTicker();
      this._startTicker();
      this._checkCelebration();
    }).catch(() => this.setData({ loading: false, error: true }));
  },

  onToggle(e) {
    const key = e.currentTarget.dataset.key;
    const { habits, todayRecords } = this.data;
    const old = !!todayRecords[key];
    todayRecords[key] = !old;
    this.setData({ todayRecords, dayPoints: util.calcDayPoints(habits, todayRecords) });

    api.toggle(app.globalData.userId, key)
      .then(() => api.getPoints(app.globalData.userId))
      .then(pts => {
        this.setData({ availablePoints: pts.available });
        this._checkCelebration();
      }).catch(() => {
        todayRecords[key] = old;
        this.setData({ todayRecords, dayPoints: util.calcDayPoints(habits, todayRecords) });
        wx.showToast({ title: '操作失败', icon: 'none' });
      });
  },

  _clearTicker() {
    if (this._ticker) { clearTimeout(this._ticker); this._ticker = null; }
  },

  _startTicker() {
    this._clearTicker();
    if (!this.data.hasBroadcasts) return;
    this._ticker = setTimeout(() => {
      if (!this._isActive) return;
      const { broadcastIdx, broadcasts } = this.data;
      const next = (broadcastIdx + 1) % broadcasts.length;
      this.setData({ broadcastIdx: next });
      this._updateTicker();
      this._startTicker();
    }, 3500);
  },

  _updateTicker() {
    if (!this._isActive) return;
    const { broadcasts, broadcastIdx } = this.data;
    if (!broadcasts || !broadcasts.length) return;
    const b = broadcasts[broadcastIdx % broadcasts.length];
    this.setData({
      curBroadcast: Object.assign({}, b, { _timeAgo: util.timeAgo(b.created_at) }),
    });
  },

  goBroadcast() { wx.switchTab({ url: '/pages/broadcast/broadcast' }); },

  _checkCelebration() {
    const { habits, todayRecords } = this.data;
    if (!this._isActive || !util.isAllDone(habits, todayRecords)) return;
    const particles = ['🌟', '✨', '🎉', '🎊', '💫', '⭐', '🌸', '🍀', '💎', '🔥'];
    const items = [];
    for (let i = 0; i < 20; i++) {
      items.push({ text: particles[i % 10], left: Math.random() * 100, delay: Math.random() * 1.2, duration: 1.5 + Math.random() * 2, size: 1 + Math.random() * 1.5 });
    }
    this.setData({ celebrate: true, celebrateItems: items });
    setTimeout(() => { if (this._isActive) this.setData({ celebrate: false, celebrateItems: [] }); }, 3500);
  },
});
