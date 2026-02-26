import { get, post, put } from '@/utils/request';

/**
 * 发送验证码
 * @param params 发送验证码参数
 */
export function sendCode(params: UserApi.SendCodeParams) {
  return post<UserApi.SendCodeResponse>('/users/send-code', params);
}

/**
 * 用户注册
 * @param params 注册参数
 */
export function register(params: UserApi.RegisterParams) {
  return post<UserApi.RegisterResponse>('/users/register', params);
}

/**
 * 用户登录
 * @param params 登录参数
 */
export function login(params: UserApi.LoginParams) {
  return post<UserApi.LoginResponse>('/users/login', params);
}
