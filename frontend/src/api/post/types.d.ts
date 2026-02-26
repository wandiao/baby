declare namespace PostApi {
  // 生成配文响应
  interface GenerateCaptionResponse {
    caption: string;
  }

  // 帖子数据
  interface Post {
    id: string;
    images: string[];
    caption: string;
    createdAt: string;
    timeDiff?: string;
  }

  // 创建帖子请求
  interface CreatePostRequest {
    images: string[];
    caption: string;
    timeDiff?: string;
  }

  // 更新帖子请求
  interface UpdatePostRequest {
    caption?: string;
    images?: string[];
  }

  // 通用响应
  interface Response<T = any> {
    code: number;
    message: string;
    data: T;
  }

  // 表单上传签名响应
  interface PostSignatureResponse {
    policy: string;
    signature: string;
    OSSAccessKeyId: string;
    host: string;
    dir: string;
  }
}
