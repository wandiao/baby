import { get, post, put, del } from '@/utils/request';

/**
 * 生成配文
 * @param images 图片URL列表
 */
export function generateCaption(image: string) {
  return post<{ caption: string }>('/posts/generate-caption', { image });
}

/**
 * 创建帖子
 * @param params 帖子参数
 */
export function createPost(params: { images: string[]; caption: string; timeDiff?: string }) {
  return post('/posts', params);
}

/**
 * 获取帖子列表
 */
export function getPosts() {
  return get('/posts');
}

/**
 * 获取单个帖子
 * @param id 帖子ID
 */
export function getPost(id: string) {
  return get(`/posts/${id}`);
}

/**
 * 更新帖子
 * @param id 帖子ID
 * @param params 更新参数
 */
export function updatePost(
  id: string,
  params: {
    caption?: string;
    images?: string[];
  },
) {
  return put(`/posts/${id}`, params);
}

/**
 * 删除帖子
 * @param id 帖子ID
 */
export function deletePost(id: string) {
  return del(`/posts/${id}`);
}

/**
 * 获取表单上传签名
 */
export function getPostSignature() {
  return post<{
    policy: string;
    signature: string;
    OSSAccessKeyId: string;
    host: string;
    dir: string;
  }>('/oss/presign');
}
