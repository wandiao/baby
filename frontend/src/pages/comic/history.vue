<template>
  <view class="min-h-screen bg-gradient-to-br from-[#F0F9F8] via-[#E8F7F5] to-[#D9F4F0]">
    <PageHeader title="历史记录">
      <template #right>
        <text class="text-[#5BA8A0] text-sm font-medium" @click="clearHistory">清空</text>
      </template>
    </PageHeader>

    <view class="pt-20 pb-8 px-4 max-w-lg mx-auto">
      <view v-if="loading" class="flex items-center justify-center h-[70vh]">
        <u-loading mode="spinner" color="#80D8CC"></u-loading>
        <text class="text-gray-500 ml-3 text-sm">加载中...</text>
      </view>

      <view v-else-if="historyList.length > 0" class="space-y-4">
        <view
          v-for="(item, index) in historyList"
          :key="item.id"
          class="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg shadow-[#80D8CC]/10 overflow-hidden border border-white/50 hover:shadow-xl hover:shadow-[#80D8CC]/15 transition-all duration-300 cursor-pointer"
          @click="navigateToDetail(item.id)"
        >
          <view class="p-4">
            <view class="mb-3">
              <text class="text-[#5BA8A0] text-sm font-semibold">{{
                formatTime(item.createdAt)
              }}</text>
            </view>

            <view class="mb-3">
              <text class="text-gray-800 text-base font-semibold block mb-2">{{
                item.title
              }}</text>
              <text class="text-gray-600 text-sm mb-2 block line-clamp-2">{{
                item.storyContent
              }}</text>
            </view>

            <view class="grid grid-cols-2 gap-2 mb-3">
              <image
                v-if="item.images.length > 0"
                :src="item.images[0]"
                mode="aspectFill"
                class="w-full h-24 rounded-xl"
              />
            </view>

            <view class="flex items-center justify-end space-x-4">
              <text
                class="text-[#80D8CC] text-xs font-medium cursor-pointer hover:text-[#5BA8A0] transition-colors"
                @click="shareItem(item)"
                >分享</text
              >
              <text
                class="text-gray-400 text-xs cursor-pointer hover:text-red-400 transition-colors"
                @click="deleteItem(item.id, index)"
                >删除</text
              >
            </view>
          </view>
        </view>
      </view>

      <view v-else class="flex flex-col items-center justify-center h-[70vh]">
        <view
          class="w-24 h-24 rounded-full bg-gradient-to-br from-[#80D8CC]/20 to-[#5BA8A0]/10 flex items-center justify-center mb-6"
        >
          <text class="text-5xl">🎨</text>
        </view>
        <text class="text-gray-600 text-lg font-medium mb-2">暂无四格漫画记录</text>
        <text class="text-gray-400 text-sm text-center max-w-xs">生成四格漫画后，会在这里显示</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getComics, deleteComic } from '@/api/comic';
import type { Comic } from '@/api/comic/types';

const historyList = ref<Comic[]>([]);
const loading = ref(false);

const shareItem = (item: Comic) => {
  uni.showActionSheet({
    itemList: ['分享到微信', '分享到朋友圈', '分享到QQ', '复制文本'],
    success: (res) => {
      if (res.tapIndex === 3) {
        uni.setClipboardData({
          data: `${item.title}\n\n${item.storyContent}`,
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

const deleteItem = async (id: string, index: number) => {
  uni.showModal({
    title: '删除记录',
    content: '确定要删除这条记录吗？',
    success: async (res) => {
      if (res.confirm) {
        const [err] = await deleteComic(id);
        if (err) {
          console.error('删除失败:', err);
          showMessage('删除失败，请重试');
          return;
        }
        historyList.value.splice(index, 1);
        showMessage('删除成功');
      }
    },
  });
};

const clearHistory = () => {
  uni.showModal({
    title: '清空记录',
    content: '确定要清空所有历史记录吗？',
    success: async (res) => {
      if (res.confirm) {
        const deletePromises = historyList.value.map((item) => deleteComic(item.id));
        await Promise.all(deletePromises);
        historyList.value = [];
        showMessage('清空成功');
      }
    },
  });
};

const navigateToDetail = (id: string) => {
  uni.navigateTo({ url: `/pages/comic/detail?id=${id}` });
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

const fetchHistory = async () => {
  loading.value = true;
  const [err, res] = await getComics();
  loading.value = false;
  if (err) {
    console.error('获取历史记录失败:', err);
    showMessage('获取历史记录失败');
    return;
  }
  historyList.value = res || [];
};

onMounted(() => {
  fetchHistory();
});
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
