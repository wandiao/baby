export interface GenerateStoryParams {
  prompt: string;
  type?: string;
  length?: string;
  ageGroup?: string;
}

export interface StreamChunk {
  type: 'thinking' | 'title' | 'content' | 'done';
  content: string;
}

export interface CreateStoryParams {
  title: string;
  content: string;
  prompt: string;
  type?: string;
  length?: string;
  ageGroup?: string;
  thinkingProcess?: string;
}

export interface Story {
  id: string;
  title: string;
  content: string;
  prompt: string;
  type: string;
  length: string;
  ageGroup: string;
  thinkingProcess?: string;
  createdAt: string;
  updatedAt: string;
}
