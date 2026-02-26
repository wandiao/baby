<template>
  <view class="min-h-screen bg-gradient-to-br from-[#F0F9F8] via-[#E8F7F5] to-[#D9F4F0]">
    <PageHeader title="视频创作">
      <template #right>
        <text class="text-[#5BA8A0] text-sm font-medium" @click="navigateToHistory">历史记录</text>
      </template>
    </PageHeader>

    <view class="pt-20 pb-32 px-4 max-w-lg mx-auto">
      <view
        class="bg-white/70 backdrop-blur-sm rounded-3xl shadow-lg shadow-[#80D8CC]/20 p-6 mb-6 border border-white/50"
      >
        <text class="text-gray-800 font-semibold mb-5 block text-base">上传照片</text>
        <view class="flex flex-wrap gap-4 justify-center">
          <view
            v-if="selectedImages.length === 0"
            class="w-40 h-40 border-2 border-dashed border-[#80D8CC]/40 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-[#80D8CC] hover:bg-[#80D8CC]/5 transition-all duration-300 group"
            @click="chooseImage"
            :disabled="uploading"
          >
            <text class="text-[#80D8CC] text-4xl mb-2 group-hover:scale-110 transition-transform"
              >+</text
            >
            <text class="text-[#5BA8A0] text-sm font-medium">添加照片</text>
          </view>
          <view
            v-for="(image, index) in selectedImages"
            :key="index"
            class="w-40 h-40 rounded-2xl overflow-hidden relative shadow-md"
          >
            <image :src="image.url" mode="aspectFill" class="w-full h-full object-cover"></image>
            <view
              class="absolute top-2 right-2 w-7 h-7 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-sm cursor-pointer hover:bg-black/60 transition-colors"
              @click="removeImage(index)"
            >
              ×
            </view>
            <view
              v-if="image.uploading"
              class="absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center"
            >
              <u-loading mode="spinner" color="#FFFFFF" size="20"></u-loading>
            </view>
          </view>
        </view>
        <text class="text-gray-400 text-xs mt-4 text-center block">支持上传多张照片</text>
      </view>

      <view
        class="bg-white/70 backdrop-blur-sm rounded-3xl shadow-lg shadow-[#80D8CC]/20 p-6 mb-6 border border-white/50"
      >
        <text class="text-gray-800 font-semibold mb-4 block text-base">提示词</text>

        <view>
          <u-input
            v-model="prompt"
            type="textarea"
            placeholder="描述你想要生成的视频内容，例如：宝宝在花园里快乐地玩耍"
            :border="true"
            borderColor="#80D8CC"
            :maxlength="200"
            :custom-style="{
              backgroundColor: '#F8FBFB',
              borderRadius: '16px',
              minHeight: '100px',
              fontSize: '14px',
              lineHeight: '1.6',
            }"
          />
          <text class="text-gray-400 text-xs mt-2 block text-right">{{ prompt.length }}/200</text>
        </view>

        <view class="mt-4">
          <text class="text-gray-600 text-sm font-medium mb-3 block">时长选择</text>
          <view class="flex gap-3">
            <view
              v-for="(option, index) in durationOptions"
              :key="index"
              class="flex-1 py-2 rounded-lg text-xs transition-all duration-300 cursor-pointer text-center"
              :class="
                selectedDuration === option.value
                  ? 'bg-[#80D8CC] text-white'
                  : 'bg-[#F8FBFB] text-gray-600'
              "
              @click="selectDuration(option.value)"
            >
              <text class="font-medium">{{ option.label }}</text>
            </view>
          </view>
        </view>

        <view class="mt-4">
          <text class="text-gray-600 text-sm font-medium mb-3 block">提示词模板</text>
          <view class="flex flex-wrap gap-2">
            <view
              v-for="(template, index) in promptTemplates"
              :key="index"
              class="px-3 py-2 bg-[#F8FBFB] rounded-lg text-xs text-[#5BA8A0] cursor-pointer hover:bg-[#80D8CC]/10 transition-colors"
              @click="useTemplate(template)"
            >
              {{ template }}
            </view>
          </view>
        </view>
      </view>

      <view
        v-if="generatedVideo.videoUrl"
        id="result-container"
        class="bg-white/70 backdrop-blur-sm rounded-3xl shadow-lg shadow-[#80D8CC]/20 p-6 mb-6 border border-white/50"
      >
        <text class="text-gray-800 font-semibold mb-5 block text-base">生成结果</text>

        <view v-if="generating" class="flex items-center justify-center py-8">
          <u-loading mode="spinner" color="#80D8CC"></u-loading>
          <text class="text-gray-500 ml-3 text-sm">生成视频中，请稍候...</text>
        </view>

        <view v-else class="space-y-4">
          <view class="bg-white/70 backdrop-blur-sm rounded-2xl overflow-hidden">
            <video
              :src="generatedVideo.videoUrl"
              class="w-full rounded-2xl"
              controls
              :show-center-play-btn="true"
              :show-play-btn="true"
              :enable-progress-gesture="true"
              :show-fullscreen-btn="true"
            ></video>
          </view>

          <view class="flex gap-3">
            <view
              class="flex-1 py-3 rounded-xl text-sm transition-all duration-300 cursor-pointer text-center"
              :class="saved ? 'bg-gray-300 text-gray-500' : 'bg-[#80D8CC] text-white'"
              @click="saveVideo"
            >
              {{ saved ? '已保存' : '保存视频' }}
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
          :disabled="uploadedImages.length === 0 || !prompt.trim()"
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
          @click="generateVideo"
        >
          {{ generatedVideo.videoUrl ? '重新生成' : '生成视频' }}
        </u-button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue';
import { generateVideo as generateVideoApi, createVideo, pollVideoStatus } from '@/api/video';
import { uploadFile } from '@/utils/upload';
import PageHeader from '@/components/PageHeader.vue';

const selectedImages = ref([]);
const uploadedImages = ref([]);
const uploading = ref(false);
const generating = ref(false);
const saved = ref(false);
const selectedDuration = ref(10);

const prompt = ref('');
const promptTemplates = [
  '宝宝在花园里快乐地玩耍',
  '温馨的家庭时光',
  '宝宝第一次学走路',
  '阳光下的美好瞬间',
];

const durationOptions = [
  { label: '2秒', value: 2 },
  { label: '5秒', value: 5 },
  { label: '10秒', value: 10 },
];

const generatedVideo = ref({
  videoUrl: '',
});

const chooseImage = () => {
  uni.chooseImage({
    count: 4,
    sizeType: ['original', 'compressed'],
    sourceType: ['album', 'camera'],
    success: async (res) => {
      for (let i = 0; i < res.tempFiles.length; i++) {
        if (selectedImages.value.length >= 4) {
          showMessage('最多上传4张照片');
          break;
        }

        uploading.value = true;
        const [err, fileUrl] = await uploadFile(res.tempFiles[i].path, res.tempFiles[i].name);
        if (err) {
          console.error('上传图片失败:', err);
          showMessage('上传图片失败');
          uploading.value = false;
          continue;
        }
        selectedImages.value.push({ url: fileUrl, uploading: false });
        uploadedImages.value.push(fileUrl);
        uploading.value = false;
      }
    },
    fail: (err) => {
      console.error('选择照片失败:', err);
    },
  });
};

const removeImage = (index) => {
  selectedImages.value.splice(index, 1);
  uploadedImages.value.splice(index, 1);
};

const useTemplate = (template) => {
  prompt.value = template;
};

const selectDuration = (duration) => {
  selectedDuration.value = duration;
};

const generateVideo = async () => {
  if (uploadedImages.value.length === 0) {
    showMessage('请先上传照片');
    return;
  }

  if (!prompt.value.trim()) {
    showMessage('请输入提示词');
    return;
  }

  if (prompt.value.length > 200) {
    showMessage('提示词不能超过200字');
    return;
  }

  generating.value = true;

  try {
    const [err, res] = await generateVideoApi({
      prompt: prompt.value,
      referenceUrls: uploadedImages.value,
      duration: selectedDuration.value,
    });

    if (err) {
      showMessage('生成失败，请重试');
      generating.value = false;
      return;
    }

    const data = res?.data || res;

    if (data?.videoId) {
      showMessage('视频生成任务已提交，请在历史记录中查看进度');
      generating.value = false;

      setTimeout(() => {
        uni.navigateTo({ url: '/pages/video/history' });
      }, 1000);
    } else {
      showMessage('生成失败，请重试');
      generating.value = false;
    }
  } catch (error) {
    console.error('生成视频失败:', error);
    showMessage('生成失败，请重试');
    generating.value = false;
  }
};

const saveVideo = async () => {
  if (saved.value) return;
  if (!generatedVideo.value.videoUrl) return;

  const [err] = await createVideo({
    title: '视频创作',
    prompt: prompt.value,
    videoUrl: generatedVideo.value.videoUrl,
  });

  if (err) {
    console.error('保存视频失败:', err);
    showMessage('保存失败，请重试');
  } else {
    saved.value = true;
    showMessage('保存成功');
  }
};

const regenerate = () => {
  generateVideo();
};

const navigateToHistory = () => {
  uni.navigateTo({ url: '/pages/video/history' });
};
</script>

<style scoped>
.u-input__wrap {
  border-radius: 16px !important;
}

.u-input__textarea {
  min-height: 100px !important;
  font-size: 14px !important;
  line-height: 1.6 !important;
}

.u-button--primary {
  background: linear-gradient(135deg, #80d8cc 0%, #5ba8a0 100%) !important;
}

.u-button--primary:hover {
  background: linear-gradient(135deg, #5ba8a0 0%, #4a8f85 100%) !important;
}
</style>
