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

      <view v-else-if="historyList.length > 0" class="relative">
        <view
          class="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#80D8CC] via-[#80D8CC]/50 to-transparent"
        ></view>

        <view
          v-for="(item, index) in historyList"
          :key="item.id"
          class="relative pl-16 pb-8 last:pb-0"
        >
          <view
            class="absolute left-[18px] top-4 w-4 h-4 rounded-full bg-[#80D8CC] border-4 border-white shadow-lg z-10"
          ></view>

          <view class="mb-2">
            <text class="text-[#5BA8A0] text-sm font-semibold">{{
              formatTime(item.createdAt)
            }}</text>
          </view>

          <view
            class="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg shadow-[#80D8CC]/10 overflow-hidden border border-white/50 hover:shadow-xl hover:shadow-[#80D8CC]/15 transition-all duration-300 cursor-pointer"
            @click="navigateToDetail(item.id)"
          >
            <view class="p-4">
              <view class="flex gap-4">
                <view class="flex-shrink-0">
                  <image
                    :src="item.images[0]"
                    mode="aspectFill"
                    class="w-24 h-24 rounded-xl object-cover shadow-md"
                    @click="previewImage(item.images[0], item.images)"
                  ></image>
                </view>

                <view class="flex-1 flex flex-col justify-between">
                  <view class="bg-[#F8FBFB] rounded-xl p-3 flex-1">
                    <text class="text-gray-700 text-sm leading-relaxed line-clamp-3">{{
                      item.caption
                    }}</text>
                  </view>

                  <view class="flex items-center justify-end space-x-4 mt-2">
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
          </view>
        </view>
      </view>

      <view v-else class="flex flex-col items-center justify-center h-[70vh]">
        <view
          class="w-24 h-24 rounded-full bg-gradient-to-br from-[#80D8CC]/20 to-[#5BA8A0]/10 flex items-center justify-center mb-6"
        >
          <text class="text-5xl">📷</text>
        </view>
        <text class="text-gray-600 text-lg font-medium mb-2">暂无照片配文记录</text>
        <text class="text-gray-400 text-sm text-center max-w-xs"
          >上传照片并生成配文后，会在这里显示</text
        >
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getPosts, deletePost } from '@/api/post';

const historyList = ref([]);
const loading = ref(false);

const previewImage = (current, urls) => {
  uni.previewImage({
    current: current,
    urls: urls,
  });
};

const navigateToDetail = (id) => {
  uni.navigateTo({ url: `/pages/photo-caption/detail?id=${id}` });
};

const shareItem = (item) => {
  uni.showActionSheet({
    itemList: ['分享到微信', '分享到朋友圈', '分享到QQ'],
    success: (res) => {
      console.log('分享到:', res.tapIndex);
    },
  });
};

const deleteItem = async (id, index) => {
  uni.showModal({
    title: '删除记录',
    content: '确定要删除这条记录吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await deletePost(id);
          historyList.value.splice(index, 1);
          showMessage('删除成功');
        } catch (error) {
          console.error('删除失败:', error);
          showMessage('删除失败，请重试');
        }
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
        try {
          const deletePromises = historyList.value.map((item) => deletePost(item.id));
          await Promise.all(deletePromises);
          historyList.value = [];
          showMessage('清空成功');
        } catch (error) {
          console.error('清空失败:', error);
          showMessage('清空失败，请重试');
        }
      }
    },
  });
};

const formatTime = (time) => {
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
  try {
    const [err, res] = await getPosts();
    if (err) {
      console.error('获取历史记录失败:', err);
      showMessage('获取历史记录失败');
      return;
    }
    historyList.value = res || [];
  } catch (error) {
    console.error('获取历史记录失败:', error);
    showMessage('获取历史记录失败');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchHistory();
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
