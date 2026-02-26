<template>
  <view class="min-h-screen bg-gradient-to-br from-[#F0F9F8] via-[#E8F7F5] to-[#D9F4F0]">
    <PageHeader title="照片配文">
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
          <view v-else class="w-40 h-40 rounded-2xl overflow-hidden relative shadow-md">
            <image
              :src="selectedImages[0].url"
              mode="aspectFill"
              class="w-full h-full object-cover"
            ></image>
            <view
              class="absolute top-2 right-2 w-7 h-7 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-sm cursor-pointer hover:bg-black/60 transition-colors"
              @click="removeImage(0)"
            >
              ×
            </view>
            <view
              v-if="selectedImages[0].uploading"
              class="absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center"
            >
              <u-loading mode="spinner" color="#FFFFFF" size="20"></u-loading>
            </view>
          </view>
        </view>
        <!-- <text class="text-gray-400 text-xs mt-4 text-center block">仅支持上传一张照片</text> -->
      </view>

      <view
        class="bg-white/70 backdrop-blur-sm rounded-3xl shadow-lg shadow-[#80D8CC]/20 p-6 mb-6 border border-white/50"
        v-if="uploadedImages.length > 0"
      >
        <text class="text-gray-800 font-semibold mb-5 block text-base">配文编辑</text>

        <view v-if="loading" class="flex items-center justify-center py-12">
          <u-loading mode="spinner" color="#80D8CC"></u-loading>
          <text class="text-gray-500 ml-3 text-sm">生成配文中...</text>
        </view>

        <view v-else class="space-y-4">
          <view class="relative">
            <u-input
              v-model="editedCaption"
              type="textarea"
              placeholder="配文将自动生成..."
              :border="false"
              :custom-style="{
                backgroundColor: '#F8FBFB',
                borderRadius: '16px',
                minHeight: '140px',
                padding: '16px',
                fontSize: '15px',
                lineHeight: '1.6',
              }"
            />
            <view
              v-if="!loading && uploadedImages.length > 0"
              class="absolute right-3 bottom-3 text-[#80D8CC] text-xs font-medium cursor-pointer hover:text-[#5BA8A0] transition-colors"
              @click="regenerateCaptions"
            >
              重新生成
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
            :loading="saving"
            :disabled="uploadedImages.length === 0 || !editedCaption"
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
            @click="savePost"
          >
            保存
          </u-button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { generateCaption, createPost } from '@/api/post';
import { uploadFile } from '@/utils/upload';

const selectedImages = ref([]);
const uploadedImages = ref([]);
const uploading = ref(false);
const loading = ref(false);
const saving = ref(false);

const editedCaption = ref('');

const chooseImage = () => {
  if (selectedImages.value.length >= 1) {
    showMessage('仅支持上传一张照片');
    return;
  }

  uni.chooseImage({
    count: 1,
    sizeType: ['original', 'compressed'],
    sourceType: ['album', 'camera'],
    success: async (res) => {
      uploading.value = true;
      const [err, fileUrl] = await uploadFile(res.tempFiles[0].path, res.tempFiles[0].name);
      if (err) {
        console.error('上传图片失败:', err);
        showMessage('上传图片失败');
        uploading.value = false;
        return;
      }
      selectedImages.value = [{ url: fileUrl, uploading: false }];
      uploadedImages.value = [fileUrl];
      uploading.value = false;
      await generateCaptions();
    },
    fail: (err) => {
      console.error('选择照片失败:', err);
    },
  });
};

const removeImage = (index) => {
  selectedImages.value.splice(index, 1);
  uploadedImages.value = [];
  editedCaption.value = '';
};

const generateCaptions = async () => {
  if (uploadedImages.value.length === 0) return;

  loading.value = true;
  const [err, res] = await generateCaption(uploadedImages.value[0]);
  if (err) {
    editedCaption.value =
      '美好的瞬间，值得被记录。每一张照片都是时光的印记，每一个微笑都藏着故事。';
  } else {
    editedCaption.value = res.caption;
  }
  loading.value = false;
};

const regenerateCaptions = async () => {
  await generateCaptions();
};

const savePost = async () => {
  if (uploadedImages.value.length === 0 || !editedCaption.value) return;

  saving.value = true;
  const [err] = await createPost({
    images: uploadedImages.value,
    caption: editedCaption.value,
  });
  if (err) {
    console.error('保存失败:', err);
    showMessage('保存失败，请重试');
    saving.value = false;
    return;
  }

  showMessage('保存成功');

  selectedImages.value = [];
  uploadedImages.value = [];
  editedCaption.value = '';

  setTimeout(() => {
    uni.redirectTo({ url: '/pages/photo-caption/history' });
  }, 500);
};

const navigateToHistory = () => {
  uni.navigateTo({ url: '/pages/photo-caption/history' });
};
</script>

<style scoped>
.u-input__wrap {
  border-radius: 16px !important;
}

.u-input__textarea {
  min-height: 140px !important;
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
