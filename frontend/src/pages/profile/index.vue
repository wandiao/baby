<template>
  <view
    class="min-h-screen bg-gradient-to-br from-[#F0F9F8] via-[#E8F7F5] to-[#D9F4F0] flex flex-col"
  >
    <PageHeader title="我的" />

    <view class="flex-1 pt-24 px-4 pb-24">
      <view class="w-full max-w-md space-y-6">
        <view
          class="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg shadow-[#80D8CC]/20 p-6 border border-white/50"
        >
          <view class="flex items-center gap-4">
            <view
              class="w-16 h-16 rounded-full bg-gradient-to-br from-[#80D8CC] to-[#5BA8A0] flex items-center justify-center shadow-md flex-shrink-0"
            >
              <text class="text-3xl"><u-icon color="#FFFFFF" name="account" /></text>
            </view>
            <view class="flex-1 flex flex-col">
              <text class="text-gray-800 text-lg font-semibold mb-1">{{ userInfo.nickname }}</text>
              <text class="text-gray-500 text-sm">记录生活中的美好瞬间</text>
            </view>
          </view>
        </view>

        <view
          class="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg shadow-[#80D8CC]/20 p-4 border border-white/50"
        >
          <view class="text-lg font-bold tracking-wide flex-1">我的创作</view>
          <view class="grid grid-cols-4 gap-3">
            <view
              v-for="(item, index) in creationItems"
              :key="index"
              class="flex flex-col items-center justify-center py-4 rounded-xl bg-[#F8FBFB] hover:bg-[#80D8CC]/10 transition-all duration-300 cursor-pointer"
              @click="navigateToCreation(item.path)"
            >
              <text class="text-3xl mb-2">{{ item.icon }}</text>
              <text class="text-gray-700 text-xs font-medium">{{ item.label }}</text>
            </view>
          </view>
        </view>

        <!-- <view
          class="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg shadow-[#80D8CC]/20 p-4 border border-white/50"
        >
          <view class="text-lg font-bold tracking-wide flex-1 mb-4">历史记录</view>
          <view class="space-y-3">
            <view
              v-for="(item, index) in historyItems"
              :key="index"
              class="flex items-center justify-between p-4 rounded-xl bg-[#F8FBFB] hover:bg-[#80D8CC]/10 transition-all duration-300 cursor-pointer"
              @click="navigateToHistory(item.path)"
            >
              <view class="flex items-center gap-3">
                <text class="text-2xl">{{ item.icon }}</text>
                <text class="text-gray-700 text-sm font-medium">{{ item.label }}</text>
              </view>
              <u-icon name="arrow-right" color="#80D8CC" size="16"></u-icon>
            </view>
          </view>
        </view> -->
      </view>
    </view>

    <view
      class="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[#F0F9F8] via-[#F0F9F8] to-transparent p-4 pb-20"
    >
      <view class="max-w-md mx-auto">
        <u-button
          type="default"
          plain
          :custom-style="{
            backgroundColor: 'transparent',
            borderColor: '#F8B5B5',
            color: '#F8B5B5',
            height: '44px',
            fontSize: '15px',
            fontWeight: '500',
            borderRadius: '12px',
            borderWidth: '1px',
          }"
          @click="logout"
        >
          退出登录
        </u-button>
      </view>
    </view>

    <TabBar :active-tab="activeTabBar" @change="handleTabChange" />
  </view>
</template>

<script setup>
import { ref } from 'vue';
import PageHeader from '@/components/PageHeader.vue';
import TabBar from '@/components/TabBar.vue';
import { useUserStore } from '../../stores/user';

const activeTabBar = ref('profile');
const userStore = useUserStore();
const userInfo = userStore.userInfo;

const creationItems = [
  { label: '照片配文', value: 'photo', icon: '📷', path: '/pages/photo-caption/history' },
  { label: '睡前故事', value: 'story', icon: '📖', path: '/pages/story/history' },
  { label: '4格漫画', value: 'comic', icon: '🎨', path: '/pages/comic/history' },
  { label: '视频创作', value: 'video', icon: '🎬', path: '/pages/video/history' },
];

const historyItems = [
  { label: '照片配文历史', icon: '📷', path: '/pages/photo-caption/history' },
  { label: '睡前故事历史', icon: '📖', path: '/pages/story/history' },
];

const handleTabChange = (value) => {};

const navigateToCreation = (path) => {
  uni.navigateTo({ url: path });
};

const navigateToHistory = (path) => {
  uni.navigateTo({ url: path });
};

const logout = () => {
  uni.showModal({
    title: '退出登录',
    content: '确定要退出登录吗？',
    confirmColor: '#F8B5B5',
    success: (res) => {
      if (res.confirm) {
        userStore.clearUser();
        uni.redirectTo({ url: '/pages/login/index' });
      }
    },
  });
};
</script>

<style scoped></style>
