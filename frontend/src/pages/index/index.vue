<template>
  <view class="min-h-screen bg-gradient-to-br from-[#F0F9F8] via-[#E8F7F5] to-[#D9F4F0]">
    <view class="pt-12 pb-24 px-4 min-h-screen flex flex-col items-center justify-center">
      <view class="w-full max-w-md space-y-6">
        <view
          class="bg-white/70 backdrop-blur-sm rounded-3xl shadow-lg shadow-[#80D8CC]/20 p-6 border border-white/50 hover:shadow-xl hover:shadow-[#80D8CC]/30 transition-all duration-300 cursor-pointer group"
          @click="navigateToFunction('photo')"
        >
          <view class="flex items-center gap-5">
            <view
              class="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#80D8CC] to-[#5BA8A0] flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300"
            >
              <text class="text-3xl">📷</text>
            </view>
            <view class="flex-1">
              <text class="text-gray-800 text-lg font-semibold mb-1 block">照片配文</text>
              <text class="text-gray-500 text-sm">记录美好时光</text>
            </view>
            <u-icon name="arrow-right" color="#80D8CC" size="20"></u-icon>
          </view>
        </view>

        <view
          class="bg-white/70 backdrop-blur-sm rounded-3xl shadow-lg shadow-[#80D8CC]/20 p-6 border border-white/50 hover:shadow-xl hover:shadow-[#80D8CC]/30 transition-all duration-300 cursor-pointer group"
          @click="navigateToFunction('story')"
        >
          <view class="flex items-center gap-5">
            <view
              class="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#80D8CC] to-[#5BA8A0] flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300"
            >
              <text class="text-3xl">📖</text>
            </view>
            <view class="flex-1">
              <text class="text-gray-800 text-lg font-semibold mb-1 block">睡前故事</text>
              <text class="text-gray-500 text-sm">亲子陪伴时光</text>
            </view>
            <u-icon name="arrow-right" color="#80D8CC" size="20"></u-icon>
          </view>
        </view>

        <view
          class="bg-white/70 backdrop-blur-sm rounded-3xl shadow-lg shadow-[#80D8CC]/20 p-6 border border-white/50 hover:shadow-xl hover:shadow-[#80D8CC]/30 transition-all duration-300 cursor-pointer group"
          @click="navigateToFunction('comic')"
        >
          <view class="flex items-center gap-5">
            <view
              class="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#80D8CC] to-[#5BA8A0] flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300"
            >
              <text class="text-3xl">🎨</text>
            </view>
            <view class="flex-1">
              <text class="text-gray-800 text-lg font-semibold mb-1 block">4格漫画</text>
              <text class="text-gray-500 text-sm">趣味创作简单</text>
            </view>
            <u-icon name="arrow-right" color="#80D8CC" size="20"></u-icon>
          </view>
        </view>

        <view
          class="bg-white/70 backdrop-blur-sm rounded-3xl shadow-lg shadow-[#80D8CC]/20 p-6 border border-white/50 hover:shadow-xl hover:shadow-[#80D8CC]/30 transition-all duration-300 cursor-pointer group"
          @click="navigateToFunction('video')"
        >
          <view class="flex items-center gap-5">
            <view
              class="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#80D8CC] to-[#5BA8A0] flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300"
            >
              <text class="text-3xl">🎬</text>
            </view>
            <view class="flex-1">
              <text class="text-gray-800 text-lg font-semibold mb-1 block">视频创作</text>
              <text class="text-gray-500 text-sm">照片生成视频</text>
            </view>
            <u-icon name="arrow-right" color="#80D8CC" size="20"></u-icon>
          </view>
        </view>
      </view>
    </view>

    <TabBar :active-tab="activeTab" @change="handleTabChange" />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import TabBar from '@/components/TabBar.vue';
import { useAuth } from '@/hooks/useAuth';

const activeTab = ref('home');
const { checkAuth } = useAuth();
checkAuth();

const navigateToFunction = (type: string) => {
  console.log('跳转到功能页面', type);

  if (type === 'photo') {
    uni.navigateTo({
      url: '/pages/photo-caption/index',
    });
  } else if (type === 'story') {
    uni.navigateTo({
      url: '/pages/story/index',
    });
  } else if (type === 'comic') {
    uni.navigateTo({
      url: '/pages/comic/index',
    });
  } else if (type === 'video') {
    uni.navigateTo({
      url: '/pages/video/index',
    });
  }
};

const handleTabChange = (value: string) => {};
</script>

<style scoped></style>
