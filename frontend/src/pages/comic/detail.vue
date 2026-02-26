<template>
  <view class="min-h-screen bg-gradient-to-br from-[#F0F9F8] via-[#E8F7F5] to-[#D9F4F0]">
    <PageHeader title="漫画详情"></PageHeader>

    <view class="pt-20 pb-8 px-4 max-w-lg mx-auto">
      <view v-if="loading" class="flex items-center justify-center h-[70vh]">
        <u-loading mode="spinner" color="#80D8CC"></u-loading>
        <text class="text-gray-500 ml-3 text-sm">加载中...</text>
      </view>

      <view v-else-if="comic" class="space-y-6">
        <view
          class="bg-white/70 backdrop-blur-sm rounded-3xl shadow-lg shadow-[#80D8CC]/20 p-6 border border-white/50"
        >
          <view class="mb-4">
            <text class="text-[#5BA8A0] text-sm font-semibold">{{
              formatTime(comic.createdAt)
            }}</text>
          </view>

          <view class="mb-4">
            <text class="text-gray-800 text-xl font-bold block">{{ comic.title }}</text>
          </view>

          <view class="mb-4">
            <text class="text-[#5BA8A0] text-sm font-medium mb-2 block">故事内容</text>
            <view class="bg-[#F8FBFB] rounded-2xl p-4">
              <text class="text-gray-700 text-base leading-relaxed whitespace-pre-wrap">{{
                comic.storyContent
              }}</text>
            </view>
          </view>

          <view>
            <text class="text-[#5BA8A0] text-sm font-medium mb-3 block">四格漫画</text>
            <view class="bg-[#F8FBFB] rounded-2xl p-4">
              <image
                v-if="comic.images.length > 0"
                :src="comic.images[0]"
                mode="widthFix"
                class="w-full rounded-2xl"
                @click="previewImage(0)"
              />
            </view>
          </view>

          <view v-if="comic.sceneDescriptions.length > 0" class="mt-4 space-y-3">
            <view
              v-for="(description, index) in comic.sceneDescriptions"
              :key="index"
              class="bg-[#F8FBFB] rounded-xl p-3"
            >
              <text class="text-[#5BA8A0] text-xs font-medium mb-1 block">场景{{ index + 1 }}</text>
              <text class="text-gray-700 text-sm leading-relaxed">{{ description }}</text>
            </view>
          </view>
        </view>

        <view class="flex items-center justify-center space-x-4">
          <view
            class="flex items-center space-x-2 bg-white/70 backdrop-blur-sm rounded-2xl shadow-md shadow-[#80D8CC]/10 px-6 py-3 border border-white/50 cursor-pointer hover:shadow-lg hover:shadow-[#80D8CC]/15 transition-all duration-300"
            @click="shareComic"
          >
            <u-icon name="share" color="#80D8CC" size="20"></u-icon>
            <text class="text-[#80D8CC] text-sm font-medium">分享</text>
          </view>
          <view
            class="flex items-center space-x-2 bg-white/70 backdrop-blur-sm rounded-2xl shadow-md shadow-[#80D8CC]/10 px-6 py-3 border border-white/50 cursor-pointer hover:shadow-lg hover:shadow-[#80D8CC]/15 transition-all duration-300"
            @click="deleteComic"
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
          <text class="text-5xl">🎨</text>
        </view>
        <text class="text-gray-600 text-lg font-medium mb-2">漫画不存在</text>
        <text class="text-gray-400 text-sm text-center max-w-xs">该漫画可能已被删除或不存在</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getComic, deleteComic as deleteComicApi } from '@/api/comic';
import type { Comic } from '@/api/comic/types';
import PageHeader from '@/components/PageHeader.vue';

const comic = ref<Comic | null>(null);
const loading = ref(false);

const shareComic = () => {
  if (!comic.value) return;

  uni.showActionSheet({
    itemList: ['分享到微信', '分享到朋友圈', '分享到QQ', '复制文本'],
    success: (res) => {
      if (res.tapIndex === 3) {
        uni.setClipboardData({
          data: `${comic.value.title}\n\n${comic.value.storyContent}`,
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

const deleteComic = () => {
  if (!comic.value) return;

  uni.showModal({
    title: '删除漫画',
    content: '确定要删除这条漫画吗？',
    success: async (res) => {
      if (res.confirm) {
        const [err] = await deleteComicApi(comic.value.id);
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

const previewImage = (index: number) => {
  if (!comic.value || comic.value.images.length === 0) return;

  uni.previewImage({
    current: 0,
    urls: comic.value.images,
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

const fetchComic = async () => {
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const options = currentPage.options;
  const comicId = options.id;

  if (!comicId) {
    showMessage('参数错误');
    setTimeout(() => {
      uni.navigateBack();
    }, 500);
    return;
  }

  loading.value = true;
  try {
    const [err, res] = await getComic(comicId);
    if (err) {
      console.error('获取漫画详情失败:', err);
      showMessage('获取漫画详情失败');
      return;
    }
    comic.value = res;
  } catch (error) {
    console.error('获取漫画详情失败:', error);
    showMessage('获取漫画详情失败');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchComic();
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
