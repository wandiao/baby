import { get, post, del } from '@/utils/request';
import type { GenerateComicParams, CreateComicParams, Comic, GenerateComicResponse } from './types';

/**
 * 生成四格漫画
 * @param params 漫画生成参数
 */
export function generateComic(params: GenerateComicParams) {
  return post<GenerateComicResponse>('/comics/generate', params);
}

/**
 * 保存四格漫画
 * @param params 漫画参数
 */
export function createComic(params: CreateComicParams) {
  return post<Comic>('/comics', params);
}

/**
 * 获取四格漫画列表
 */
export function getComics() {
  return get<Comic[]>('/comics');
}

/**
 * 获取单个四格漫画
 * @param id 漫画ID
 */
export function getComic(id: string) {
  return get<Comic>(`/comics/${id}`);
}

/**
 * 删除四格漫画
 * @param id 漫画ID
 */
export function deleteComic(id: string) {
  return del(`/comics/${id}`);
}
