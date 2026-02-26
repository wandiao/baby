<template>
  <view class="min-h-screen bg-gradient-to-br from-[#F0F9F8] via-[#E8F7F5] to-[#D9F4F0]">
    <PageHeader title="睡前故事">
      <template #right>
        <text class="text-[#5BA8A0] text-sm font-medium" @click="navigateToHistory">历史记录</text>
      </template>
    </PageHeader>

    <view class="pt-20 pb-32 px-4 max-w-lg mx-auto">
      <view
        class="bg-white/70 backdrop-blur-sm rounded-3xl shadow-lg shadow-[#80D8CC]/20 p-6 mb-6 border border-white/50"
      >
        <text class="text-gray-800 font-semibold mb-4 block text-base">故事需求</text>

        <view class="space-y-4">
          <view>
            <u-input
              v-model="prompt"
              type="textarea"
              placeholder="输入故事关键词，如：小熊、森林、友谊"
              :border="true"
              borderColor="#80D8CC"
              :maxlength="50"
              :custom-style="{
                backgroundColor: '#F8FBFB',
                borderRadius: '16px',
                minHeight: '80px',
                fontSize: '14px',
                lineHeight: '1.6',
              }"
            />
            <text class="text-gray-400 text-xs mt-2 block text-right">{{ prompt.length }}/50</text>
          </view>

          <view>
            <text class="text-gray-600 text-sm mb-2 block">故事类型</text>
            <view class="flex flex-wrap gap-2">
              <view
                v-for="type in storyTypes"
                :key="type"
                class="px-3 py-1.5 rounded-full text-xs transition-all duration-300 cursor-pointer"
                :class="
                  selectedType === type ? 'bg-[#80D8CC] text-white' : 'bg-[#F8FBFB] text-gray-600'
                "
                @click="selectedType = type"
              >
                {{ type }}
              </view>
            </view>
          </view>

          <view>
            <text class="text-gray-600 text-sm mb-2 block">故事长度</text>
            <view class="flex gap-2">
              <view
                v-for="length in storyLengths"
                :key="length.value"
                class="flex-1 py-2 rounded-lg text-xs transition-all duration-300 cursor-pointer text-center"
                :class="
                  selectedLength === length.value
                    ? 'bg-[#80D8CC] text-white'
                    : 'bg-[#F8FBFB] text-gray-600'
                "
                @click="selectedLength = length.value"
              >
                {{ length.label }}
              </view>
            </view>
          </view>

          <view>
            <text class="text-gray-600 text-sm mb-2 block">适合年龄段</text>
            <view class="flex gap-2">
              <view
                v-for="age in ageGroups"
                :key="age"
                class="flex-1 py-2 rounded-lg text-xs transition-all duration-300 cursor-pointer text-center"
                :class="
                  selectedAgeGroup === age
                    ? 'bg-[#80D8CC] text-white'
                    : 'bg-[#F8FBFB] text-gray-600'
                "
                @click="selectedAgeGroup = age"
              >
                {{ age }}
              </view>
            </view>
          </view>
        </view>
      </view>

      <view
        v-if="generatedStory.title || generatedStory.content || generatedStory.thinkingProcess"
        id="result-container"
        class="bg-white/70 backdrop-blur-sm rounded-3xl shadow-lg shadow-[#80D8CC]/20 p-6 mb-6 border border-white/50"
        style="min-height: 60vh"
      >
        <text class="text-gray-800 font-semibold mb-5 block text-base">生成结果</text>

        <view v-if="generating" class="flex items-center justify-center py-8">
          <u-loading mode="spinner" color="#80D8CC"></u-loading>
          <text class="text-gray-500 ml-3 text-sm">生成故事中...</text>
        </view>

        <view v-else class="space-y-4">
          <!-- <view v-if="generatedStory.thinkingProcess" class="bg-[#F8FBFB] rounded-2xl p-4">
            <text class="text-[#5BA8A0] text-sm font-medium mb-2 block">思考过程</text>
            <text class="text-gray-600 text-sm leading-relaxed">{{
              generatedStory.thinkingProcess
            }}</text>
          </view> -->

          <view v-if="generatedStory.title" class="bg-[#F8FBFB] rounded-2xl p-4">
            <text class="text-[#5BA8A0] text-sm font-medium mb-2 block">故事标题</text>
            <text class="text-gray-800 text-base font-semibold">{{ generatedStory.title }}</text>
          </view>

          <view v-if="generatedStory.content" class="bg-[#F8FBFB] rounded-2xl p-4">
            <text class="text-[#5BA8A0] text-sm font-medium mb-2 block">故事正文</text>
            <text class="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{{
              generatedStory.content
            }}</text>
          </view>

          <!-- <view class="flex gap-3">
            <view
              class="flex-1 py-3 rounded-xl text-sm transition-all duration-300 cursor-pointer text-center flex items-center justify-center gap-2"
              :class="isPlaying ? 'bg-[#80D8CC] text-white' : 'bg-[#F8FBFB] text-gray-600'"
              @click="toggleSpeech"
            >
              <u-icon :name="isPlaying ? 'pause-circle' : 'play-circle'" :size="18"></u-icon>
              <text>{{ isPlaying ? '暂停' : '朗读' }}</text>
            </view>
            <view
              class="flex-1 py-3 rounded-xl text-sm transition-all duration-300 cursor-pointer text-center"
              :class="
                voiceType === 'male' ? 'bg-[#80D8CC] text-white' : 'bg-[#F8FBFB] text-gray-600'
              "
              @click="voiceType = 'male'"
            >
              男声
            </view>
            <view
              class="flex-1 py-3 rounded-xl text-sm transition-all duration-300 cursor-pointer text-center"
              :class="
                voiceType === 'female' ? 'bg-[#80D8CC] text-white' : 'bg-[#F8FBFB] text-gray-600'
              "
              @click="voiceType = 'female'"
            >
              女声
            </view>
          </view> -->
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
          @click="generateStory"
        >
          {{ generatedStory.title ? '重新生成' : '生成故事' }}
        </u-button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onUnmounted, nextTick } from 'vue';
import { generateStory as generateStoryApi, createStory } from '@/api/story';
import PageHeader from '@/components/PageHeader.vue';

const prompt = ref('');
const selectedType = ref('童话类');
const selectedLength = ref('中款');
const selectedAgeGroup = ref('5-7岁');

const storyTypes = ['童话类', '科普类', '安抚类', '动物类', '其他类'];
const storyLengths = [
  { label: '短款', value: '短款' },
  { label: '中款', value: '中款' },
  { label: '长款', value: '长款' },
];
const ageGroups = ['2-4岁', '5-7岁', '7岁以上'];

const generating = ref(false);
const generatedStory = ref({
  title: '',
  content: '',
  thinkingProcess: '',
});

const isPlaying = ref(false);
const voiceType = ref<'male' | 'female'>('female');
let speechSynthesis: any = null;
let currentUtterance: any = null;

const generateStory = async () => {
  console.log(123);
  if (!prompt.value.trim()) {
    showMessage('请输入提示词');
    return;
  }

  if (prompt.value.length > 50) {
    showMessage('提示词不能超过50字');
    return;
  }

  generating.value = true;
  generatedStory.value = {
    title: '',
    content: '',
    thinkingProcess: '',
  };

  try {
    const [err, res] = await generateStoryApi({
      prompt: prompt.value,
      type: selectedType.value,
      length: selectedLength.value,
      ageGroup: selectedAgeGroup.value,
    });

    if (err) {
      showMessage('生成失败，请重试');
      generating.value = false;
      return;
    }

    // 处理后端返回的数据结构，支持 res.data 和直接 res 两种格式
    const data = res?.data || res;

    if (data && typeof data === 'object') {
      generatedStory.value = {
        title: data.title || '',
        content: data.content || '',
        thinkingProcess: data.thinking || data.thinkingProcess || '',
      };
    }

    await saveStory();

    nextTick(() => {
      uni.pageScrollTo({
        selector: '#result-container',
        duration: 300,
      });
    });
  } catch (error) {
    console.error('生成故事失败:', error);
    showMessage('生成失败，请重试');
  }

  generating.value = false;
};

const saveStory = async () => {
  if (!generatedStory.value.title || !generatedStory.value.content) return;

  const [err] = await createStory({
    title: generatedStory.value.title,
    content: generatedStory.value.content,
    prompt: prompt.value,
    type: selectedType.value,
    length: selectedLength.value,
    ageGroup: selectedAgeGroup.value,
    thinkingProcess: generatedStory.value.thinkingProcess,
  });

  if (err) {
    console.error('保存故事失败:', err);
  } else {
  }
};

const toggleSpeech = () => {
  if (!generatedStory.value.content) return;

  if (isPlaying.value) {
    stopSpeech();
  } else {
    startSpeech();
  }
};

const startSpeech = () => {
  if (!generatedStory.value.content) return;

  speechSynthesis = uni.getBackgroundAudioManager();

  speechSynthesis.title = generatedStory.value.title || '睡前故事';
  speechSynthesis.src = '';
  speechSynthesis.play();

  isPlaying.value = true;

  speechSynthesis.onEnded(() => {
    isPlaying.value = false;
  });

  speechSynthesis.onError((err: any) => {
    console.error('语音播放失败:', err);
    isPlaying.value = false;
    showMessage('语音播放失败');
  });
};

const stopSpeech = () => {
  if (speechSynthesis) {
    speechSynthesis.stop();
    isPlaying.value = false;
  }
};

onUnmounted(() => {
  stopSpeech();
});

const navigateToHistory = () => {
  uni.navigateTo({ url: '/pages/story/history' });
};
</script>

<style scoped>
.u-input__wrap {
  border-radius: 16px !important;
}

.u-input__textarea {
  min-height: 100px !important;
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
