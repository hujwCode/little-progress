// ✨ 小进步 - API 封装
const app = getApp();

function getBaseUrl() {
  return app.globalData.API_BASE;
}

function request(method, path, data) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: getBaseUrl() + path,
      method,
      data,
      header: { 'Content-Type': 'application/json' },
      success(res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else {
          const detail = res.data?.detail || `请求失败 (${res.statusCode})`;
          reject(new Error(detail));
        }
      },
      fail() {
        reject(new Error('网络连接失败，请检查网络设置'));
      },
    });
  });
}

module.exports = {
  login(userId) {
    return request('POST', '/api/login', { user_id: userId });
  },
  getHabits(userId) {
    return request('GET', `/api/habits?user_id=${userId}`);
  },
  toggle(userId, habitKey) {
    return request('POST', '/api/toggle', { user_id: userId, habit_key: habitKey });
  },
  getPoints(userId) {
    return request('GET', `/api/points?user_id=${userId}`);
  },
  getMonthRecords(userId, year, month) {
    return request('GET', `/api/records/month?user_id=${userId}&year=${year}&month=${month}`);
  },
  getWeekStats(userId) {
    return request('GET', `/api/week-stats?user_id=${userId}`);
  },
  getBroadcasts() {
    return request('GET', '/api/broadcasts');
  },
  sendBroadcast(userId, content) {
    return request('POST', '/api/broadcasts', { user_id: userId, content });
  },
  claimReward(userId, rewardId) {
    return request('POST', '/api/rewards/claim', { user_id: userId, reward_id: rewardId });
  },
  getRedemptionHistory(userId) {
    return request('GET', `/api/rewards/history?user_id=${userId}`);
  },
  resetAll() {
    return request('POST', '/api/reset-all');
  },
};
