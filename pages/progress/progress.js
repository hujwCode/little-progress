const app = getApp();
const api = require('../../utils/api');
const util = require('../../utils/util');

Page({
  data: {
    loading: true, error: false,
    monthName: '', year: 0, month: 0, todayStr: '',
    weekStats: null, monthDone: 0, monthTotal: 0, monthPct: 0,
    habits: [],
    weekDays: ['日', '一', '二', '三', '四', '五', '六'],
    calendarDays: [],
  },

  onShow() {
    if (!app.globalData.userId) { wx.redirectTo({ url: '/pages/index/index' }); return; }
    if (!this.data.loading) { this.loadData(true); } else { this.loadData(false); }
  },

  loadData(silent) {
    const uid = app.globalData.userId;
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const todayStr = util.getDateStr();
    const { daysInMonth, firstDayOfWeek } = util.getMonthInfo(year, month);
    if (!silent) this.setData({ loading: true, error: false });

    const onErr = silent && this._loaded
      ? () => {}  // silent 刷新失败不显示错误
      : () => this.setData({ loading: false, error: true });

    Promise.all([
      api.getMonthRecords(uid, year, month),
      api.getWeekStats(uid),
      api.getHabits(uid),
    ]).then(([records, weekStats, habits]) => {
      let monthDone = 0, monthTotal = 0;
      for (let d = 1; d <= daysInMonth; d++) {
        const ds = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        if (ds <= todayStr) {
          const dayData = records[ds];
          monthDone += dayData ? dayData.done_count : 0;
          monthTotal += habits.length;
        }
      }
      const monthPct = monthTotal ? Math.round(monthDone / monthTotal * 100) : 0;
      const cals = [];
      for (let i = 0; i < firstDayOfWeek; i++) cals.push({ empty: true });
      for (let d = 1; d <= daysInMonth; d++) {
        const ds = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const isFuture = ds > todayStr;
        const isToday = ds === todayStr;
        const dayData = records[ds];
        const doneCount = dayData ? dayData.done_count : 0;
        cals.push({ day: d, isToday, isFuture, empty: false,
          allDone: !isFuture && doneCount === habits.length,
          partialDone: !isFuture && doneCount > 0 });
      }
      this._loaded = true;
      this.setData({
        loading: false, monthName: util.getMonthName(month),
        year, month, todayStr, weekStats, monthDone, monthTotal, monthPct,
        habits, calendarDays: cals,
      });
    }).catch(onErr);
  },
});
