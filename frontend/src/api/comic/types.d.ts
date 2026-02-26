export interface GenerateComicParams {
  storyContent: string;
  title?: string;
  storyId?: string;
}

export interface CreateComicParams {
  title: string;
  storyContent: string;
  images: string[];
  sceneDescriptions: string[];
  storyId?: string;
}

export interface Comic {
  id: string;
  title: string;
  storyContent: string;
  images: string[];
  sceneDescriptions: string[];
  storyId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GenerateComicResponse {
  images: string[];
  sceneDescriptions: string[];
}
