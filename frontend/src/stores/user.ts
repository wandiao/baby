import { defineStore } from 'pinia';

/**
 * 用户状态管理
 */
export const useUserStore = defineStore('user', {
  state: () => ({
    /**
     * 访问令牌
     */
    token: uni.getStorageSync('access_token') || '',
    /**
     * 用户信息
     */
    userInfo: uni.getStorageSync('user_info') || null,
    /**
     * 是否登录
     */
    isLoggedIn: !!uni.getStorageSync('access_token'),
  }),
  getters: {
    /**
     * 获取访问令牌
     */
    getToken: (state) => state.token,
    /**
     * 获取用户信息
     */
    getUserInfo: (state) => state.userInfo,
    /**
     * 检查是否登录
     */
    getIsLoggedIn: (state) => state.isLoggedIn,
  },
  actions: {
    /**
     * 设置用户信息和令牌
     * @param token 访问令牌
     * @param userInfo 用户信息
     */
    setUser(token: string, userInfo: any) {
      this.token = token;
      this.userInfo = userInfo;
      this.isLoggedIn = true;
      // 存储到本地存储
      uni.setStorageSync('access_token', token);
      uni.setStorageSync('user_info', userInfo);
    },
    /**
     * 清除用户信息
     */
    clearUser() {
      this.token = '';
      this.userInfo = null;
      this.isLoggedIn = false;
      // 从本地存储中清除
      uni.removeStorageSync('access_token');
      uni.removeStorageSync('user_info');
    },
    /**
     * 刷新用户信息
     * @param userInfo 新的用户信息
     */
    updateUserInfo(userInfo: any) {
      this.userInfo = userInfo;
      // 更新本地存储
      uni.setStorageSync('user_info', userInfo);
    },
    /**
     * 刷新令牌
     * @param token 新的访问令牌
     */
    updateToken(token: string) {
      this.token = token;
      this.isLoggedIn = true;
      // 更新本地存储
      uni.setStorageSync('access_token', token);
    },
  },
});
