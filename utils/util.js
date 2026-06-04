// ✨ 小进步 - 工具函数

function getDateStr(date) {
  const d = date || new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function timeAgo(isoStr) {
  if (!isoStr) return '';
  const diff = Math.floor((Date.now() - new Date(isoStr).getTime()) / 1000);
  if (diff < 60) return '刚刚';
  if (diff < 3600) return Math.floor(diff / 60) + '分钟前';
  if (diff < 86400) return Math.floor(diff / 3600) + '小时前';
  return Math.floor(diff / 86400) + '天前';
}

function isAllDone(habits, todayRecords) {
  if (!habits || !todayRecords) return false;
  return habits.every(h => todayRecords[h.key]);
}

function calcDayPoints(habits, todayRecords) {
  if (!habits || !todayRecords) return 0;
  return habits.reduce((sum, h) => sum + (todayRecords[h.key] ? h.points : 0), 0);
}

function calcMaxDayPoints(habits) {
  if (!habits) return 0;
  return habits.reduce((sum, h) => sum + h.points, 0);
}

function getMonthInfo(year, month) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay();
  return { daysInMonth, firstDayOfWeek };
}

function getMonthName(month) {
  const names = ['一月', '二月', '三月', '四月', '五月', '六月',
    '七月', '八月', '九月', '十月', '十一月', '十二月'];
  return names[month - 1] || '';
}

function getTierLabel(threshold) {
  if (threshold <= 100) return '🥉';
  if (threshold <= 350) return '🥈';
  if (threshold <= 750) return '🥇';
  return '💎';
}

function showToast(title, icon) {
  wx.showToast({ title, icon: icon || 'none', duration: 2000 });
}

module.exports = {
  getDateStr, timeAgo, isAllDone, calcDayPoints,
  calcMaxDayPoints, getMonthInfo, getMonthName, getTierLabel, showToast,
};
