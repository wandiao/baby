import { get, post, del } from '@/utils/request';
import type { GenerateStoryParams, CreateStoryParams, Story } from './types';

/**
 * 生成睡前故事（流式输出）
 * @param params 故事生成参数
 */
export function generateStory(params: GenerateStoryParams) {
  return post('/stories/generate', params);
}

/**
 * 保存睡前故事
 * @param params 故事参数
 */
export function createStory(params: CreateStoryParams) {
  return post<Story>('/stories', params);
}

/**
 * 获取睡前故事列表
 */
export function getStories() {
  return get<Story[]>('/stories');
}

/**
 * 获取单个睡前故事
 * @param id 故事ID
 */
export function getStory(id: string) {
  return get<Story>(`/stories/${id}`);
}

/**
 * 删除睡前故事
 * @param id 故事ID
 */
export function deleteStory(id: string) {
  return del(`/stories/${id}`);
}

/**
 * 搜索睡前故事
 * @param keyword 搜索关键词
 */
export function searchStories(keyword: string) {
  return get<Story[]>('/stories/search', { keyword });
}
