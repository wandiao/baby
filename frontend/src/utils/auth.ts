/**
 * 认证相关工具函数
 */

/**
 * 存储访问令牌
 * @param token 访问令牌
 */
export function setAccessToken(token: string): void {
  uni.setStorageSync('access_token', token);
}

/**
 * 获取访问令牌
 * @returns 访问令牌
 */
export function getAccessToken(): string | null {
  return uni.getStorageSync('access_token');
}

/**
 * 存储用户信息
 * @param user 用户信息
 */
export function setUserInfo(user: any): void {
  uni.setStorageSync('user_info', user);
}

/**
 * 获取用户信息
 * @returns 用户信息
 */
export function getUserInfo(): any {
  return uni.getStorageSync('user_info');
}

/**
 * 清除认证信息
 */
export function clearAuth(): void {
  uni.removeStorageSync('access_token');
  uni.removeStorageSync('user_info');
}

/**
 * 刷新访问令牌
 * @returns 新的访问令牌
 */
export async function refreshAccessToken(): Promise<string | null> {
  // 这里应该调用刷新令牌的接口
  // 暂时返回null，后续可以实现具体逻辑
  return null;
}
