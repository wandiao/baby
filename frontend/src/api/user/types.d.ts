declare namespace UserApi {
  /**
   * 发送验证码参数
   */
  export interface SendCodeParams {
    phone: string;
    type: 'register' | 'login' | 'reset';
  }

  export interface SendCodeResponse {
    message: string;
  }

  /**
   * 用户注册参数
   */
  export interface RegisterParams {
    phone: string;
    code: string;
    password: string;
    agree: boolean;
  }

  export interface RegisterResponse {
    token: string;
    user: User;
  }

  /**
   * 用户登录参数
   */
  export interface LoginParams {
    phone: string;
    password: string;
    type: 'password' | 'code';
  }

  export interface LoginResponse {
    token: string;
    user: User;
  }

  export type User = {
    id: string;
    phone: string;
    nickname: string;
  };
}
