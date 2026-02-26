<template>
  <view class="min-h-screen bg-gradient-to-br from-[#F0F9F8] via-[#E8F7F5] to-[#D9F4F0]">
    <PageHeader title="故事详情"></PageHeader>

    <view class="pt-20 pb-8 px-4 max-w-lg mx-auto">
      <view v-if="loading" class="flex items-center justify-center h-[70vh]">
        <u-loading mode="spinner" color="#80D8CC"></u-loading>
        <text class="text-gray-500 ml-3 text-sm">加载中...</text>
      </view>

      <view v-else-if="story" class="space-y-6">
        <view
          class="bg-white/70 backdrop-blur-sm rounded-3xl shadow-lg shadow-[#80D8CC]/20 p-6 border border-white/50"
        >
          <view class="flex items-center justify-between mb-4">
            <!-- <text class="text-[#5BA8A0] text-sm font-semibold">{{
              formatTime(story.createdAt)
            }}</text> -->
            <view class="flex items-center gap-2">
              <view class="px-3 py-1 rounded-full text-xs" :class="getTypeClass(story.type)">
                {{ story.type }}
              </view>
              <view class="px-3 py-1 rounded-full text-xs bg-[#F8FBFB] text-gray-600">
                {{ story.length }}
              </view>
              <view class="px-3 py-1 rounded-full text-xs bg-[#F8FBFB] text-gray-600">
                {{ story.ageGroup }}
              </view>
            </view>
          </view>

          <view class="mb-4">
            <text class="text-gray-600 text-sm mb-2 block">提示词</text>
            <text class="text-gray-800 text-base font-semibold block">{{ story.prompt }}</text>
          </view>

          <view v-if="story.thinkingProcess" class="mb-4">
            <text class="text-[#5BA8A0] text-sm font-medium mb-2 block">思考过程</text>
            <view class="bg-[#F8FBFB] rounded-2xl p-4">
              <text class="text-gray-600 text-sm leading-relaxed">{{ story.thinkingProcess }}</text>
            </view>
          </view>

          <view class="mb-4">
            <text class="text-[#5BA8A0] text-sm font-medium mb-2 block">故事标题</text>
            <text class="text-gray-800 text-xl font-bold block">{{ story.title }}</text>
          </view>

          <view>
            <text class="text-[#5BA8A0] text-sm font-medium mb-2 block">故事正文</text>
            <view class="bg-[#F8FBFB] rounded-2xl p-4">
              <text class="text-gray-700 text-base leading-relaxed whitespace-pre-wrap">{{
                story.content
              }}</text>
            </view>
          </view>
        </view>

        <view class="flex items-center justify-center space-x-4">
          <!-- <view
            class="flex items-center space-x-2 bg-white/70 backdrop-blur-sm rounded-2xl shadow-md shadow-[#80D8CC]/10 px-6 py-3 border border-white/50 cursor-pointer hover:shadow-lg hover:shadow-[#80D8CC]/15 transition-all duration-300"
            @click="toggleSpeech"
          >
            <u-icon :name="isPlaying ? 'pause-circle' : 'play-circle'" :size="20"></u-icon>
            <text class="text-[#80D8CC] text-sm font-medium">{{
              isPlaying ? '暂停' : '朗读'
            }}</text>
          </view> -->
          <view
            class="flex items-center space-x-2 bg-white/70 backdrop-blur-sm rounded-2xl shadow-md shadow-[#80D8CC]/10 px-6 py-3 border border-white/50 cursor-pointer hover:shadow-lg hover:shadow-[#80D8CC]/15 transition-all duration-300"
            @click="shareStory"
          >
            <u-icon name="share" color="#80D8CC" size="20"></u-icon>
            <text class="text-[#80D8CC] text-sm font-medium">分享</text>
          </view>
          <view
            class="flex items-center space-x-2 bg-white/70 backdrop-blur-sm rounded-2xl shadow-md shadow-[#80D8CC]/10 px-6 py-3 border border-white/50 cursor-pointer hover:shadow-lg hover:shadow-[#80D8CC]/15 transition-all duration-300"
            @click="deleteStory"
          >
            <u-icon name="trash" color="#FF6B6B" size="20"></u-icon>
            <text class="text-[#FF6B6B] text-sm font-medium">删除</text>
          </view>
        </view>
      </view>

      <view v-else class="flex flex-col items-center justify-center h-[70vh]">
        <view
          class="w-24 h-24 rounded-full bg-gradient-to-br from-[#80D8CC]/20 to-[#5BA8A0]/10 flex items-center justify-center mb-6"
        >
          <text class="text-5xl">📖</text>
        </view>
        <text class="text-gray-600 text-lg font-medium mb-2">故事不存在</text>
        <text class="text-gray-400 text-sm text-center max-w-xs">该故事可能已被删除或不存在</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { getStory, deleteStory as deleteStoryApi } from '@/api/story';
import type { Story } from '@/api/story/types';
import PageHeader from '@/components/PageHeader.vue';

const story = ref<Story | null>(null);
const loading = ref(false);
const isPlaying = ref(false);
const voiceType = ref<'male' | 'female'>('female');
let speechSynthesis: any = null;
let currentUtterance: any = null;

const getTypeClass = (type: string) => {
  const typeMap: Record<string, string> = {
    童话类: 'bg-[#80D8CC]/20 text-[#5BA8A0]',
    科普类: 'bg-[#FFB84D]/20 text-[#FF9F1C]',
    安抚类: 'bg-[#A78BFA]/20 text-[#8B5CF6]',
    动物类: 'bg-[#6EE7B7]/20 text-[#34D399]',
    自定义类: 'bg-[#F472B6]/20 text-[#EC4899]',
  };
  return typeMap[type] || 'bg-[#F8FBFB] text-gray-600';
};

const shareStory = () => {
  if (!story.value) return;

  uni.showActionSheet({
    itemList: ['分享到微信', '分享到朋友圈', '分享到QQ', '复制文本'],
    success: (res) => {
      if (res.tapIndex === 3) {
        uni.setClipboardData({
          data: `${story.value.title}\n\n${story.value.content}`,
          success: () => {
            showMessage('复制成功');
          },
        });
      } else {
        console.log('分享到:', res.tapIndex);
      }
    },
  });
};

const deleteStory = () => {
  if (!story.value) return;

  uni.showModal({
    title: '删除故事',
    content: '确定要删除这条故事吗？',
    success: async (res) => {
      if (res.confirm) {
        const [err] = await deleteStoryApi(story.value.id);
        if (err) {
          console.error('删除失败:', err);
          showMessage('删除失败，请重试');
          return;
        }
        showMessage('删除成功');
        setTimeout(() => {
          uni.navigateBack();
        }, 500);
      }
    },
  });
};

const toggleSpeech = () => {
  if (!story.value || !story.value.content) return;

  if (isPlaying.value) {
    stopSpeech();
  } else {
    startSpeech();
  }
};

const startSpeech = () => {
  if (!story.value || !story.value.content) return;

  speechSynthesis = uni.getBackgroundAudioManager();

  speechSynthesis.title = story.value.title || '睡前故事';
  speechSynthesis.src = '';
  speechSynthesis.play();

  isPlaying.value = true;

  speechSynthesis.onEnded(() => {
    isPlaying.value = false;
  });

  speechSynthesis.onError((err: any) => {
    console.error('语音播放失败:', err);
    isPlaying.value = false;
    showMessage('语音播放失败');
  });
};

const stopSpeech = () => {
  if (speechSynthesis) {
    speechSynthesis.stop();
    isPlaying.value = false;
  }
};

const formatTime = (time: string) => {
  const date = new Date(time);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

const fetchStory = async () => {
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const options = currentPage.options;
  const storyId = options.id;

  if (!storyId) {
    showMessage('参数错误');
    setTimeout(() => {
      uni.navigateBack();
    }, 500);
    return;
  }

  loading.value = true;
  try {
    const [err, res] = await getStory(storyId);
    if (err) {
      console.error('获取故事详情失败:', err);
      showMessage('获取故事详情失败');
      return;
    }
    story.value = res;
  } catch (error) {
    console.error('获取故事详情失败:', error);
    showMessage('获取故事详情失败');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchStory();
});

onUnmounted(() => {
  stopSpeech();
});
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
