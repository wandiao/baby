export interface GenerateVideoParams {
  prompt: string;
  referenceUrls: string[];
  title?: string;
  size?: string;
  duration?: number;
  audio?: boolean;
  shotType?: string;
  watermark?: boolean;
}

export interface CreateVideoParams {
  title: string;
  prompt: string;
  videoUrl: string;
  size?: string;
  duration?: number;
  shotType?: string;
  status?: string;
}

export interface Video {
  id: string;
  title: string;
  prompt: string;
  referenceUrls: string[];
  videoUrl?: string;
  taskId?: string;
  size?: string;
  duration?: number;
  audio: boolean;
  shotType?: string;
  watermark: boolean;
  status: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GenerateVideoResponse {
  taskId: string;
  videoId: string;
}

export interface VideoStatusResponse {
  taskId: string;
  status: string;
  videoUrl?: string;
}
