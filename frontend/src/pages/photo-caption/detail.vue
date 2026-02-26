<template>
  <view class="min-h-screen bg-gradient-to-br from-[#F0F9F8] via-[#E8F7F5] to-[#D9F4F0]">
    <PageHeader title="配文详情"></PageHeader>

    <view class="pt-20 pb-8 px-4 max-w-lg mx-auto">
      <view v-if="loading" class="flex items-center justify-center h-[70vh]">
        <u-loading mode="spinner" color="#80D8CC"></u-loading>
        <text class="text-gray-500 ml-3 text-sm">加载中...</text>
      </view>

      <view v-else-if="post" class="space-y-6">
        <view
          class="bg-white/70 backdrop-blur-sm rounded-3xl shadow-lg shadow-[#80D8CC]/20 overflow-hidden border border-white/50"
        >
          <view class="p-6">
            <view class="flex items-center justify-between mb-4">
              <text class="text-[#5BA8A0] text-sm font-semibold">{{
                formatTime(post.createdAt)
              }}</text>
            </view>

            <view class="mb-6">
              <view
                v-for="(image, index) in post.images"
                :key="index"
                class="mb-4 last:mb-0"
              >
                <image
                  :src="image"
                  mode="widthFix"
                  class="w-full rounded-2xl shadow-md cursor-pointer"
                  @click="previewImage(image, post.images)"
                ></image>
              </view>
            </view>

            <view class="bg-[#F8FBFB] rounded-2xl p-5">
              <text class="text-gray-700 text-base leading-relaxed">{{
                post.caption
              }}</text>
            </view>
          </view>
        </view>

        <view class="flex items-center justify-center space-x-4">
          <view
            class="flex items-center space-x-2 bg-white/70 backdrop-blur-sm rounded-2xl shadow-md shadow-[#80D8CC]/10 px-6 py-3 border border-white/50 cursor-pointer hover:shadow-lg hover:shadow-[#80D8CC]/15 transition-all duration-300"
            @click="sharePost"
          >
            <u-icon name="share" color="#80D8CC" size="18"></u-icon>
            <text class="text-[#80D8CC] text-sm font-medium">分享</text>
          </view>

          <view
            class="flex items-center space-x-2 bg-white/70 backdrop-blur-sm rounded-2xl shadow-md shadow-[#80D8CC]/10 px-6 py-3 border border-white/50 cursor-pointer hover:shadow-lg hover:shadow-[#80D8CC]/15 transition-all duration-300"
            @click="deletePost"
          >
            <u-icon name="trash" color="#FF6B6B" size="18"></u-icon>
            <text class="text-[#FF6B6B] text-sm font-medium">删除</text>
          </view>
        </view>
      </view>

      <view v-else class="flex flex-col items-center justify-center h-[70vh]">
        <view
          class="w-24 h-24 rounded-full bg-gradient-to-br from-[#80D8CC]/20 to-[#5BA8A0]/10 flex items-center justify-center mb-6"
        >
          <text class="text-5xl">📷</text>
        </view>
        <text class="text-gray-600 text-lg font-medium mb-2">配文不存在</text>
        <text class="text-gray-400 text-sm text-center max-w-xs"
          >该配文可能已被删除或不存在</text
        >
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getPost, deletePost as deletePostApi } from '@/api/post';

const post = ref(null);
const loading = ref(false);

const previewImage = (current, urls) => {
  uni.previewImage({
    current: current,
    urls: urls,
  });
};

const sharePost = () => {
  uni.showActionSheet({
    itemList: ['分享到微信', '分享到朋友圈', '分享到QQ'],
    success: (res) => {
      console.log('分享到:', res.tapIndex);
    },
  });
};

const deletePost = () => {
  uni.showModal({
    title: '删除记录',
    content: '确定要删除这条记录吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await deletePostApi(post.value.id);
          showMessage('删除成功');
          setTimeout(() => {
            uni.navigateBack();
          }, 500);
        } catch (error) {
          console.error('删除失败:', error);
          showMessage('删除失败，请重试');
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

const fetchPost = async () => {
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const options = currentPage.options;
  const postId = options.id;

  if (!postId) {
    showMessage('参数错误');
    setTimeout(() => {
      uni.navigateBack();
    }, 500);
    return;
  }

  loading.value = true;
  try {
    const [err, res] = await getPost(postId);
    if (err) {
      console.error('获取配文详情失败:', err);
      showMessage('获取配文详情失败');
      return;
    }
    post.value = res;
  } catch (error) {
    console.error('获取配文详情失败:', error);
    showMessage('获取配文详情失败');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchPost();
});
</script>
