<template>
  <view
    class="fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-sm border-t border-gray-200 flex items-center justify-around z-50"
  >
    <view
      v-for="item in tabs"
      :key="item.value"
      class="flex flex-col items-center cursor-pointer transition-all relative"
      :class="activeTab === item.value ? 'text-primary' : 'text-gray-400'"
      @click="handleTabClick(item.value)"
    >
      <view class="relative mb-1">
        <u-icon
          :name="item.icon"
          :size="32"
          :color="activeTab === item.value ? '#26A69A' : '#9E9E9E'"
        />
      </view>
      <text class="text-xs font-medium">{{ item.label }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
interface TabItem {
  label: string;
  value: string;
  icon: string;
  pagePath: string;
}

interface Props {
  activeTab: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'change', value: string): void;
}>();

const tabs: TabItem[] = [
  { label: '首页', value: 'home', icon: 'home', pagePath: '/pages/index/index' },
  { label: '个人中心', value: 'profile', icon: 'account', pagePath: '/pages/profile/index' },
];

uni.hideTabBar();

const handleTabClick = (value: string) => {
  if (value !== props.activeTab) {
    emit('change', value);
    uni.switchTab({
      url: tabs.find((item) => item.value === value)?.pagePath || '',
    });
  }
};
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}

.transition-all {
  transition: all 0.3s ease;
}
</style>
