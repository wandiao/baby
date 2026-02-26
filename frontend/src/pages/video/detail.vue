<template>
  <view class="min-h-screen bg-gradient-to-br from-[#F0F9F8] via-[#E8F7F5] to-[#D9F4F0]">
    <PageHeader title="视频详情"></PageHeader>

    <view class="pt-20 pb-8 px-4 max-w-lg mx-auto">
      <view v-if="loading" class="flex items-center justify-center h-[70vh]">
        <u-loading mode="spinner" color="#80D8CC"></u-loading>
        <text class="text-gray-500 ml-3 text-sm">加载中...</text>
      </view>

      <view v-else-if="video" class="space-y-6">
        <view
          class="bg-white/70 backdrop-blur-sm rounded-3xl shadow-lg shadow-[#80D8CC]/20 p-6 border border-white/50"
        >
          <view class="mb-4">
            <text class="text-[#5BA8A0] text-sm font-semibold">{{
              formatTime(video.createdAt)
            }}</text>
          </view>

          <view class="mb-4">
            <text class="text-gray-800 text-xl font-bold block">{{ video.title }}</text>
          </view>

          <view class="mb-4">
            <text class="text-[#5BA8A0] text-sm font-medium mb-2 block">提示词</text>
            <view class="bg-[#F8FBFB] rounded-2xl p-4">
              <text class="text-gray-700 text-base leading-relaxed whitespace-pre-wrap">{{
                video.prompt
              }}</text>
            </view>
          </view>

          <view class="mb-4">
            <text class="text-[#5BA8A0] text-sm font-medium mb-3 block">视频</text>
            <view class="bg-[#F8FBFB] rounded-2xl overflow-hidden relative">
              <video
                v-if="video.videoUrl"
                :src="video.videoUrl"
                class="w-full rounded-2xl"
                controls
                :show-center-play-btn="true"
                :show-play-btn="true"
                :enable-progress-gesture="true"
                :show-fullscreen-btn="true"
              ></video>
              <view v-else class="absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center rounded-2xl">
                <u-loading mode="spinner" color="#FFFFFF" size="30"></u-loading>
                <text class="text-white text-sm font-medium ml-3">{{ getStatusText(video.status) }}</text>
              </view>
              <view v-if="video.status === 'failed'" class="absolute bottom-4 left-0 right-0 px-4">
                <text class="text-red-400 text-sm">{{ video.errorMessage || '视频生成失败' }}</text>
              </view>
            </view>
          </view>

          <view v-if="video.referenceUrls && video.referenceUrls.length > 0" class="mb-4">
            <text class="text-[#5BA8A0] text-sm font-medium mb-3 block">参考图片</text>
            <view class="grid grid-cols-2 gap-2">
              <image
                v-for="(url, index) in video.referenceUrls"
                :key="index"
                :src="url"
                mode="aspectFill"
                class="w-full h-24 rounded-xl cursor-pointer"
                @click="previewImage(url, video.referenceUrls)"
              />
            </view>
          </view>

          <view v-if="video.size || video.duration" class="grid grid-cols-2 gap-4">
            <view v-if="video.size" class="bg-[#F8FBFB] rounded-xl p-3">
              <text class="text-gray-400 text-xs block mb-1">分辨率</text>
              <text class="text-gray-700 text-sm font-medium">{{ video.size }}</text>
            </view>
            <view v-if="video.duration" class="bg-[#F8FBFB] rounded-xl p-3">
              <text class="text-gray-400 text-xs block mb-1">时长</text>
              <text class="text-gray-700 text-sm font-medium">{{ video.duration }}秒</text>
            </view>
          </view>
        </view>

        <view class="flex items-center justify-center space-x-4">
          <view
            class="flex items-center space-x-2 bg-white/70 backdrop-blur-sm rounded-2xl shadow-md shadow-[#80D8CC]/10 px-6 py-3 border border-white/50 cursor-pointer hover:shadow-lg hover:shadow-[#80D8CC]/15 transition-all duration-300"
            @click="shareVideo"
          >
            <u-icon name="share" color="#80D8CC" size="20"></u-icon>
            <text class="text-[#80D8CC] text-sm font-medium">分享</text>
          </view>
          <view
            class="flex items-center space-x-2 bg-white/70 backdrop-blur-sm rounded-2xl shadow-md shadow-[#80D8CC]/10 px-6 py-3 border border-white/50 cursor-pointer hover:shadow-lg hover:shadow-[#80D8CC]/15 transition-all duration-300"
            @click="deleteVideo"
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
          <text class="text-5xl">🎬</text>
        </view>
        <text class="text-gray-600 text-lg font-medium mb-2">视频不存在</text>
        <text class="text-gray-400 text-sm text-center max-w-xs">该视频可能已被删除或不存在</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { getVideo, deleteVideo as deleteVideoApi } from '@/api/video';
import type { Video } from '@/api/video/types';
import PageHeader from '@/components/PageHeader.vue';

const video = ref<Video | null>(null);
const loading = ref(false);
let refreshInterval: any = null;

const getStatusText = (status: string) => {
  switch (status) {
    case 'pending':
      return '等待中';
    case 'processing':
      return '生成中';
    case 'completed':
      return '已完成';
    case 'failed':
      return '生成失败';
    default:
      return '未知状态';
  }
};

const shareVideo = () => {
  if (!video.value) return;

  uni.showActionSheet({
    itemList: ['分享到微信', '分享到朋友圈', '分享到QQ', '复制链接'],
    success: (res) => {
      if (res.tapIndex === 3) {
        uni.setClipboardData({
          data: video.value.videoUrl || '',
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

const deleteVideo = () => {
  if (!video.value) return;

  uni.showModal({
    title: '删除视频',
    content: '确定要删除这条视频吗？',
    success: async (res) => {
      if (res.confirm) {
        const [err] = await deleteVideoApi(video.value.id);
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

const previewImage = (current: string, urls: string[]) => {
  uni.previewImage({
    current,
    urls,
  });
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

const fetchVideo = async () => {
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const options = currentPage.options;
  const videoId = options.id;

  if (!videoId) {
    showMessage('参数错误');
    setTimeout(() => {
      uni.navigateBack();
    }, 500);
    return;
  }

  loading.value = true;
  try {
    const [err, res] = await getVideo(videoId);
    if (err) {
      console.error('获取视频详情失败:', err);
      showMessage('获取视频详情失败');
      return;
    }
    video.value = res;
  } catch (error) {
    console.error('获取视频详情失败:', error);
    showMessage('获取视频详情失败');
  } finally {
    loading.value = false;
  }
};

const startAutoRefresh = () => {
  if (video.value && (video.value.status === 'pending' || video.value.status === 'processing')) {
    refreshInterval = setInterval(async () => {
      await fetchVideo();
    }, 5000);
  }
};

const stopAutoRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
};

onMounted(() => {
  fetchVideo();
  startAutoRefresh();
});

onUnmounted(() => {
  stopAutoRefresh();
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
