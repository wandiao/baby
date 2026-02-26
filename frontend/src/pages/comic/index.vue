<template>
  <view class="min-h-screen bg-gradient-to-br from-[#F0F9F8] via-[#E8F7F5] to-[#D9F4F0]">
    <PageHeader title="四格漫画">
      <template #right>
        <text class="text-[#5BA8A0] text-sm font-medium" @click="navigateToHistory">历史记录</text>
      </template>
    </PageHeader>

    <view class="pt-20 pb-32 px-4 max-w-lg mx-auto">
      <view
        class="bg-white/70 backdrop-blur-sm rounded-3xl shadow-lg shadow-[#80D8CC]/20 p-6 mb-6 border border-white/50"
      >
        <text class="text-gray-800 font-semibold mb-4 block text-base">故事内容</text>

        <view>
          <u-input
            v-model="storyContent"
            type="textarea"
            placeholder="输入故事内容，将根据故事生成四格漫画"
            :border="true"
            borderColor="#80D8CC"
            :maxlength="500"
            :custom-style="{
              backgroundColor: '#F8FBFB',
              borderRadius: '16px',
              minHeight: '120px',
              fontSize: '14px',
              lineHeight: '1.6',
            }"
          />
          <text class="text-gray-400 text-xs mt-2 block text-right"
            >{{ storyContent.length }}/500</text
          >
        </view>
      </view>

      <view
        v-if="generatedComic.images.length > 0"
        id="result-container"
        class="bg-white/70 backdrop-blur-sm rounded-3xl shadow-lg shadow-[#80D8CC]/20 p-6 mb-6 border border-white/50"
      >
        <text class="text-gray-800 font-semibold mb-5 block text-base">生成结果</text>

        <view v-if="generating" class="flex items-center justify-center py-8">
          <u-loading mode="spinner" color="#80D8CC"></u-loading>
          <text class="text-gray-500 ml-3 text-sm">生成漫画中...</text>
        </view>

        <view v-else class="space-y-4">
          <view class="bg-white/70 backdrop-blur-sm rounded-2xl p-4">
            <image
              v-if="generatedComic.images.length > 0"
              :src="generatedComic.images[0]"
              mode="widthFix"
              class="w-full rounded-2xl"
              @click="previewImage(generatedComic.images, 0)"
            />

            <view v-if="generatedComic.sceneDescriptions.length > 0" class="mt-4 space-y-3">
              <view
                v-for="(description, index) in generatedComic.sceneDescriptions"
                :key="index"
                class="bg-[#F8FBFB] rounded-xl p-3"
              >
                <text class="text-[#5BA8A0] text-xs font-medium mb-1 block"
                  >场景{{ index + 1 }}</text
                >
                <text class="text-gray-700 text-sm leading-relaxed">{{ description }}</text>
              </view>
            </view>
          </view>

          <view class="flex gap-3">
            <view
              class="flex-1 py-3 rounded-xl text-sm transition-all duration-300 cursor-pointer text-center"
              :class="saved ? 'bg-gray-300 text-gray-500' : 'bg-[#80D8CC] text-white'"
              @click="saveComic"
            >
              {{ saved ? '已保存' : '保存漫画' }}
            </view>
            <view
              class="flex-1 py-3 rounded-xl text-sm transition-all duration-300 cursor-pointer text-center bg-[#F8FBFB] text-gray-600"
              @click="regenerate"
            >
              重新生成
            </view>
          </view>
        </view>
      </view>
    </view>

    <view
      class="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#F0F9F8] via-[#F0F9F8] to-transparent"
    >
      <view class="max-w-lg mx-auto">
        <u-button
          type="primary"
          size="large"
          class="w-full"
          :loading="generating"
          :custom-style="{
            background: 'linear-gradient(135deg, #80D8CC 0%, #5BA8A0 100%)',
            boxShadow: '0 8px 24px rgba(91, 168, 160, 0.3)',
            color: '#FFFFFF',
            height: '52px',
            fontSize: '16px',
            fontWeight: '600',
            borderRadius: '16px',
            letterSpacing: '0.5px',
          }"
          @click="generateComic"
        >
          {{ generatedComic.images.length > 0 ? '重新生成' : '生成漫画' }}
        </u-button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue';
import { generateComic as generateComicApi, createComic } from '@/api/comic';
import PageHeader from '@/components/PageHeader.vue';
import { previewImage } from '../../utils/common';

const storyContent = ref('');
const generating = ref(false);
const saved = ref(false);

const generatedComic = ref({
  images: [] as string[],
  sceneDescriptions: [] as string[],
});

const generateComic = async () => {
  if (!storyContent.value.trim()) {
    showMessage('请输入故事内容');
    return;
  }

  if (storyContent.value.length > 500) {
    showMessage('故事内容不能超过500字');
    return;
  }

  generating.value = true;
  saved.value = false;
  generatedComic.value = {
    images: [],
    sceneDescriptions: [],
  };

  try {
    const [err, res] = await generateComicApi({
      storyContent: storyContent.value,
    });

    if (err) {
      showMessage('生成失败，请重试');
      generating.value = false;
      return;
    }

    const data = res?.data || res;

    if (data && typeof data === 'object') {
      generatedComic.value = {
        images: data.images || [],
        sceneDescriptions: data.sceneDescriptions || [],
      };
    }

    nextTick(() => {
      uni.pageScrollTo({
        selector: '#result-container',
        duration: 300,
      });
    });
  } catch (error) {
    console.error('生成漫画失败:', error);
    showMessage('生成失败，请重试');
  }

  generating.value = false;
};

const saveComic = async () => {
  if (saved.value) return;
  if (generatedComic.value.images.length === 0) return;

  const [err] = await createComic({
    title: '四格漫画',
    storyContent: storyContent.value,
    images: generatedComic.value.images,
    sceneDescriptions: generatedComic.value.sceneDescriptions,
  });

  if (err) {
    console.error('保存漫画失败:', err);
    showMessage('保存失败，请重试');
  } else {
    saved.value = true;
    showMessage('保存成功');
  }
};

const regenerate = () => {
  generateComic();
};

const navigateToHistory = () => {
  uni.navigateTo({ url: '/pages/comic/history' });
};
</script>

<style scoped>
.u-input__wrap {
  border-radius: 16px !important;
}

.u-input__textarea {
  min-height: 120px !important;
  font-size: 15px !important;
  line-height: 1.6 !important;
}

.u-button--primary {
  background: linear-gradient(135deg, #80d8cc 0%, #5ba8a0 100%) !important;
}

.u-button--primary:hover {
  background: linear-gradient(135deg, #5ba8a0 0%, #4a8f85 100%) !important;
}
</style>
