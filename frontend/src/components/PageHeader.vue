<template>
  <view
    class="page-header fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#80D8CC]/20"
  >
    <view class="flex items-center justify-between h-12 px-4">
      <view class="flex items-center" @click="handleBack">
        <u-icon name="arrow-left" color="#5BA8A0" size="20"></u-icon>
      </view>

      <view
        class="absolute left-1/2 -translate-x-1/2 text-lg font-bold tracking-wide flex-1 text-center"
        >{{ title }}</view
      >

      <view class="flex items-center justify-end">
        <slot name="right"></slot>
      </view>
    </view>
  </view>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: '',
  },
});

const handleBack = () => {
  uni.navigateBack();
};
</script>

<style scoped>
.page-header {
  transition: all 0.3s ease;
}
</style>
