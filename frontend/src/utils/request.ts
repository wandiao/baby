/**
 * 服务端响应接口格式
 */
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
}

/**
 * 请求配置选项
 */
export interface RequestOptions extends Omit<
  UniApp.RequestOptions,
  'success' | 'fail' | 'complete'
> {
  /**
   * 请求前处理函数
   */
  beforeRequest?: (options: UniApp.RequestOptions) => UniApp.RequestOptions;
  /**
   * 响应处理函数
   */
  afterResponse?: (response: UniApp.RequestSuccessCallbackResult) => any;
  /**
   * 是否显示加载提示
   * @default true
   */
  showLoading?: boolean;
  /**
   * 加载提示文本
   * @default '加载中...'
   */
  loadingText?: string;
  /**
   * 是否显示错误提示
   * @default true
   */
  showError?: boolean;
}

/**
 * 默认配置
 */
const defaultConfig: Partial<RequestOptions> = {
  timeout: 120000,
  showLoading: true,
  loadingText: '加载中...',
  showError: true,
  header: {
    'content-type': 'application/json',
  },
};

/**
 * 请求基础路径
 */
// const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const baseURL = import.meta.env.PROD ? location.origin + ':3000/api' : 'http://localhost:3000/api';

/**
 * 请求加载计数器
 */
let loadingCount = 0;

/**
 * 显示加载提示
 */
function showLoading(text: string) {
  if (loadingCount === 0) {
    uni.showLoading({
      title: text,
      mask: true,
    });
  }
  loadingCount++;
}

/**
 * 隐藏加载提示
 */
function hideLoading() {
  loadingCount--;
  if (loadingCount === 0) {
    uni.hideLoading();
  }
}

// 请求拦截器
const requestInterceptor = (config: RequestOptions): RequestOptions => {
  // 添加认证头
  const token = uni.getStorageSync('access_token');
  if (token) {
    config.header = {
      ...config.header,
      Authorization: `Bearer ${token}`,
    };
  }
  return config;
};

// 响应拦截器
const responseInterceptor = async (
  response: UniApp.RequestSuccessCallbackResult,
  config: RequestOptions,
): Promise<any> => {
  const data = response.data as ApiResponse;

  // 如果状态码是401，清除认证信息并返回登录页
  if (data.code === 401) {
    // 清除认证信息
    uni.removeStorageSync('access_token');
    uni.removeStorageSync('user_info');
    uni.reLaunch({ url: '/pages/login/index' });
  }

  return data;
};

/**
 * 通用请求方法
 * @param options 请求配置
 * @returns Promise<[Error, null] | [null, T]>
 */
export function request<T = any>(options: RequestOptions): Promise<[Error, null] | [null, T]> {
  // 合并默认配置
  const config = Object.assign({}, defaultConfig, options);

  // 拼接完整URL
  if (!config.url?.startsWith('http')) {
    config.url = baseURL + config.url;
  }

  // 请求拦截器
  const interceptedConfig = requestInterceptor(config);

  // 显示加载提示
  if (interceptedConfig.showLoading) {
    showLoading(interceptedConfig.loadingText || '加载中...');
  }

  return new Promise((resolve) => {
    uni.request({
      ...interceptedConfig,
      success: async (res) => {
        try {
          // 处理响应拦截器
          const data = await responseInterceptor(res, interceptedConfig);

          // 判断接口是否请求成功
          if (data.code === 0) {
            resolve([null, data.data as T]);
          } else {
            // 显示错误提示
            if (interceptedConfig.showError !== false) {
              showMessage(data.message || '请求失败');
            }
            resolve([new Error(data.message), null]);
          }
        } catch (error) {
          resolve([error instanceof Error ? error : new Error(String(error)), null]);
        }
      },
      fail: (err) => {
        // 显示错误提示
        if (interceptedConfig.showError) {
          showMessage(err.errMsg || '网络异常，请稍后重试');
        }
        resolve([new Error(err.errMsg), null]);
      },
      complete: () => {
        // 隐藏加载提示
        if (interceptedConfig.showLoading) {
          hideLoading();
        }
      },
    });
  });
}

/**
 * GET请求
 * @param url 请求地址
 * @param data 请求参数
 * @param options 请求配置
 */
export function get<T = any>(
  url: string,
  data?: any,
  options?: RequestOptions,
): Promise<[Error, null] | [null, T]> {
  return request<T>({
    url,
    data,
    method: 'GET',
    ...options,
  });
}

/**
 * POST请求
 * @param url 请求地址
 * @param data 请求参数
 * @param options 请求配置
 */
export function post<T = any>(
  url: string,
  data?: any,
  options?: RequestOptions,
): Promise<[Error, null] | [null, T]> {
  return request<T>({
    url,
    data,
    method: 'POST',
    ...options,
  });
}

/**
 * PUT请求
 * @param url 请求地址
 * @param data 请求参数
 * @param options 请求配置
 */
export function put<T = any>(
  url: string,
  data?: any,
  options?: RequestOptions,
): Promise<[Error, null] | [null, T]> {
  return request<T>({
    url,
    data,
    method: 'PUT',
    ...options,
  });
}

/**
 * DELETE请求
 * @param url 请求地址
 * @param data 请求参数
 * @param options 请求配置
 */
export function del<T = any>(
  url: string,
  data?: any,
  options?: RequestOptions,
): Promise<[Error, null] | [null, T]> {
  return request<T>({
    url,
    data,
    method: 'DELETE',
    ...options,
  });
}
