import { get, post, del } from '@/utils/request';
import type {
  GenerateVideoParams,
  CreateVideoParams,
  Video,
  GenerateVideoResponse,
  VideoStatusResponse,
} from './types';

/**
 * 生成视频
 * @param params 视频生成参数
 */
export function generateVideo(params: GenerateVideoParams) {
  return post<GenerateVideoResponse>('/videos/generate', params);
}

/**
 * 保存视频
 * @param params 视频参数
 */
export function createVideo(params: CreateVideoParams) {
  return post<Video>('/videos', params);
}

/**
 * 获取视频列表
 */
export function getVideos() {
  return get<Video[]>('/videos');
}

/**
 * 获取单个视频
 * @param id 视频ID
 */
export function getVideo(id: string) {
  return get<Video>(`/videos/${id}`);
}

/**
 * 删除视频
 * @param id 视频ID
 */
export function deleteVideo(id: string) {
  return del(`/videos/${id}`);
}
