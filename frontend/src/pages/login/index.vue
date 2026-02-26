<template>
  <view class="min-h-screen bg-light flex flex-col items-center pt-12 px-6">
    <!-- Logo区 -->
    <view class="items-center text-center mb-12 flex flex-col">
      <image src="/static/imgs/logo.png" class="w-16 h-16 mb-4 rounded-2xl shadow-soft"></image>
      <text class="text-3xl font-bold text-[var(--color-accent)] mb-2">时光绘语</text>
      <text class="text-sm text-gray-600">轻量内容生成工具</text>
    </view>

    <!-- 登录表单区 -->
    <view class="w-full max-w-xs bg-white rounded-2xl shadow-soft p-6 mb-8">
      <!-- 表单切换 -->
      <view class="flex mb-6 border-b border-gray-200">
        <text
          class="flex-1 text-center py-3 font-medium"
          :class="
            activeTab === 'login'
              ? 'text-[var(--color-accent)] border-b-2 border-[var(--color-accent)]'
              : 'text-gray-500'
          "
          @click="activeTab = 'login'"
        >
          登录
        </text>
        <text
          class="flex-1 text-center py-3 font-medium"
          :class="
            activeTab === 'register'
              ? 'text-[var(--color-accent)] border-b-2 border-[var(--color-accent)]'
              : 'text-gray-500'
          "
          @click="activeTab = 'register'"
        >
          注册
        </text>
      </view>

      <!-- 登录表单 -->
      <view v-if="activeTab === 'login'">
        <!-- 手机号输入框 -->
        <view class="mb-5">
          <u-input
            v-model="phone"
            type="number"
            placeholder="请输入手机号"
            maxlength="11"
            :border="true"
            input-align="left"
            :clearable="true"
            :custom-style="{
              borderRadius: '12px',
              height: '48px',
              borderColor: phoneError ? '#F8B5B5' : 'var(--color-border)',
            }"
            @focus="phoneFocus = true"
            @blur="phoneFocus = false"
          />
          <text v-if="phoneError" class="text-[#F8B5B5] text-xs mt-2 block"
            >请输入正确的手机号</text
          >
        </view>

        <!-- 验证码/密码切换栏 -->
        <view class="mb-5">
          <view v-if="isPassword">
            <u-input
              v-model="password"
              type="password"
              placeholder="请输入密码"
              :border="true"
              input-align="left"
              :clearable="true"
              :password-icon="true"
              :custom-style="{
                borderRadius: '12px',
                height: '48px',
                borderColor: passwordError ? '#F8B5B5' : 'var(--color-border)',
              }"
              @focus="passwordFocus = true"
              @blur="passwordFocus = false"
            />
            <text v-if="passwordError" class="text-[#F8B5B5] text-xs mt-2 block">密码错误</text>
          </view>
          <view v-else class="flex items-center gap-3">
            <u-input
              v-model="password"
              type="number"
              placeholder="请输入验证码"
              :border="true"
              input-align="left"
              :clearable="true"
              :custom-style="{
                borderRadius: '12px',
                height: '48px',
                borderColor: passwordError ? '#F8B5B5' : 'var(--color-border)',
                flex: 1,
              }"
              @focus="passwordFocus = true"
              @blur="passwordFocus = false"
            />
            <u-button
              :text="countdown > 0 ? `${countdown}s后重新获取` : '获取验证码'"
              :disabled="countdown > 0"
              size="small"
              :custom-style="{
                backgroundColor:
                  countdown > 0 ? 'var(--color-background-secondary)' : 'var(--color-secondary)',
                color: countdown > 0 ? 'var(--color-text-tertiary)' : 'white',
                borderRadius: '8px',
                padding: '0 12px',
                fontSize: '12px',
                height: '36px',
              }"
              @click="getCode"
            />
            <text v-if="passwordError" class="text-[#F8B5B5] text-xs mt-2 block">验证码错误</text>
          </view>
        </view>

        <!-- 忘记密码 - 仅在密码登录时显示 -->
        <view v-if="isPassword" class="mb-5 text-right">
          <text
            class="text-sm text-gray-600 hover:text-[var(--color-accent)] transition-colors"
            @click="showForgotPassword = true"
          >
            忘记密码
          </text>
        </view>

        <!-- 登录按钮 -->
        <u-button
          type="primary"
          size="large"
          class="w-full mb-5"
          :loading="loading"
          :disabled="!agreeProtocol"
          :custom-style="{
            background:
              'linear-gradient(135deg, var(--color-secondary), var(--color-secondary-dark))',
            borderColor: 'var(--color-secondary)',
            color: '#FFFFFF',
            height: '48px',
            fontSize: '16px',
            borderRadius: '12px',
          }"
          @click="handleLogin"
        >
          登录
        </u-button>

        <!-- 切换登录方式按钮 -->
        <view class="mb-6">
          <text
            class="text-[var(--color-primary)] text-sm text-center block py-3 cursor-pointer hover:opacity-80 transition-opacity"
            @click="isPassword = !isPassword"
          >
            {{ isPassword ? '验证码登录' : '密码登录' }}
          </text>
        </view>
      </view>

      <!-- 注册表单 -->
      <view v-else>
        <!-- 手机号输入框 -->
        <view class="mb-5">
          <u-input
            v-model="registerPhone"
            type="number"
            placeholder="请输入手机号"
            maxlength="11"
            :border="true"
            input-align="left"
            :clearable="true"
            :custom-style="{
              borderRadius: '12px',
              height: '48px',
              borderColor: registerPhoneError ? '#F8B5B5' : 'var(--color-border)',
            }"
          />
          <text v-if="registerPhoneError" class="text-[#F8B5B5] text-xs mt-2 block"
            >请输入正确的手机号</text
          >
        </view>

        <!-- 验证码输入框 -->
        <view class="mb-5">
          <view class="flex items-center gap-3">
            <u-input
              v-model="registerCode"
              type="number"
              placeholder="请输入验证码"
              maxlength="6"
              :border="true"
              input-align="left"
              :clearable="true"
              :custom-style="{
                borderRadius: '12px',
                height: '48px',
                borderColor: registerCodeError ? '#F8B5B5' : 'var(--color-border)',
                flex: 1,
              }"
            />
            <u-button
              :text="registerCountdown > 0 ? `${registerCountdown}s后重新获取` : '获取验证码'"
              :disabled="registerCountdown > 0"
              size="small"
              :custom-style="{
                backgroundColor:
                  registerCountdown > 0
                    ? 'var(--color-background-secondary)'
                    : 'var(--color-secondary)',
                color: registerCountdown > 0 ? 'var(--color-text-tertiary)' : 'white',
                borderRadius: '8px',
                padding: '0 12px',
                fontSize: '12px',
                height: '36px',
              }"
              @click="getRegisterCode"
            />
          </view>
        </view>

        <!-- 密码输入框 -->
        <view class="mb-5">
          <u-input
            v-model="registerPassword"
            type="password"
            placeholder="请设置密码（6-18位）"
            maxlength="18"
            :border="true"
            input-align="left"
            :clearable="true"
            :password-icon="true"
            :custom-style="{
              borderRadius: '12px',
              height: '48px',
              borderColor: registerPasswordError ? '#F8B5B5' : 'var(--color-border)',
            }"
          />
          <text v-if="registerPasswordError" class="text-[#F8B5B5] text-xs mt-2 block"
            >密码长度需在6-18位之间</text
          >
        </view>

        <!-- 注册按钮 -->
        <u-button
          type="primary"
          size="large"
          class="w-full mb-5"
          :loading="registerLoading"
          :disabled="!agreeProtocol"
          :custom-style="{
            background:
              'linear-gradient(135deg, var(--color-secondary), var(--color-secondary-dark))',
            borderColor: 'var(--color-secondary)',
            color: '#FFFFFF',
            height: '48px',
            fontSize: '16px',
            borderRadius: '12px',
          }"
          @click="handleRegister"
        >
          注册
        </u-button>
      </view>
    </view>

    <!-- 第三方登录区 -->
    <!-- <view class="w-full max-w-xs">
      <text class="text-center text-gray-500 text-sm mb-6 block">其他登录方式</text>
      <view class="flex justify-center gap-10">
        <view
          class="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center hover:bg-secondary/30 transition-colors cursor-pointer"
          @click="wechatLogin"
        >
          <text class="text-[var(--color-accent)] text-2xl">🍃</text>
        </view>
        <view
          class="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center hover:bg-accent/30 transition-colors cursor-pointer"
          @click="alipayLogin"
        >
          <text class="text-[var(--color-accent)] text-2xl">🌊</text>
        </view>
      </view>
    </view> -->

    <!-- 底部协议区 -->
    <view class="mt-auto pb-8 w-full max-w-xs">
      <view class="flex items-center justify-center">
        <u-checkbox :label-size="0" v-model="agreeProtocol" shape="circle" :size="28"></u-checkbox>
        <text class="text-xs text-gray-600 ml-2">
          登录即同意
          <text class="text-[var(--color-accent)]" @click="showProtocol = true"
            >《用户服务协议》</text
          >
          <text class="text-[var(--color-accent)]" @click="showPrivacy = true">《隐私政策》</text>
        </text>
      </view>
    </view>

    <!-- 忘记密码弹窗 -->
    <u-popup v-model="showForgotPassword" mode="center" :round="20">
      <view class="w-4/5 bg-white p-6 rounded-2xl">
        <text class="text-xl font-bold text-center mb-6">忘记密码</text>
        <view class="mb-5">
          <u-input
            v-model="forgotPhone"
            type="number"
            placeholder="请输入手机号"
            maxlength="11"
            :border="true"
            input-align="left"
            :clearable="true"
            :custom-style="{
              backgroundColor: 'var(--color-background-secondary)',
              borderRadius: '12px',
              height: '48px',
              borderColor: forgotPhoneError ? '#F8B5B5' : 'var(--color-border)',
            }"
          />
          <text v-if="forgotPhoneError" class="text-[#F8B5B5] text-xs mt-2 block"
            >请输入正确的手机号</text
          >
        </view>
        <view class="mb-5">
          <view class="flex items-center gap-3">
            <u-input
              v-model="forgotCode"
              type="number"
              placeholder="请输入验证码"
              maxlength="6"
              :border="true"
              input-align="left"
              :clearable="true"
              :custom-style="{
                backgroundColor: 'var(--color-background-secondary)',
                borderRadius: '12px',
                height: '48px',
                borderColor: forgotCodeError ? '#F8B5B5' : 'var(--color-border)',
                flex: 1,
              }"
            />
            <u-button
              :text="forgotCountdown > 0 ? `${forgotCountdown}s后重新获取` : '获取验证码'"
              :disabled="forgotCountdown > 0"
              size="small"
              :custom-style="{
                backgroundColor:
                  forgotCountdown > 0
                    ? 'var(--color-background-secondary)'
                    : 'var(--color-secondary)',
                color: forgotCountdown > 0 ? 'var(--color-text-tertiary)' : 'white',
                borderRadius: '8px',
                padding: '0 12px',
                fontSize: '12px',
                height: '36px',
              }"
              @click="getForgotCode"
            />
          </view>
          <text v-if="forgotCodeError" class="text-[#F8B5B5] text-xs mt-2 block">验证码错误</text>
        </view>
        <view class="mb-6">
          <u-input
            v-model="newPassword"
            type="password"
            placeholder="请设置新密码（6-18位）"
            maxlength="18"
            :border="true"
            input-align="left"
            :clearable="true"
            :password-icon="true"
            :custom-style="{
              backgroundColor: 'var(--color-background-secondary)',
              borderRadius: '12px',
              height: '48px',
              borderColor: newPasswordError ? '#F8B5B5' : 'var(--color-border)',
            }"
          />
          <text v-if="newPasswordError" class="text-[#F8B5B5] text-xs mt-2 block"
            >密码长度需在6-18位之间</text
          >
        </view>
        <u-button
          type="primary"
          size="large"
          class="w-full mb-4"
          :loading="forgotLoading"
          :custom-style="{
            background:
              'linear-gradient(135deg, var(--color-secondary), var(--color-secondary-dark))',
            borderColor: 'var(--color-secondary)',
            color: '#FFFFFF',
            height: '48px',
            fontSize: '16px',
            borderRadius: '12px',
          }"
          @click="resetPassword"
        >
          重置密码
        </u-button>
        <u-button
          type="default"
          size="large"
          class="w-full"
          :custom-style="{
            backgroundColor: 'var(--color-background-secondary)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-text-primary)',
            height: '48px',
            fontSize: '16px',
            borderRadius: '12px',
          }"
          @click="showForgotPassword = false"
        >
          取消
        </u-button>
      </view>
    </u-popup>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { sendCode, login, register } from '@/api/user';
import { useUserStore } from '@/stores/user';

// 登录表单
const activeTab = ref('login');
const phone = ref('');
const password = ref('');
const isPassword = ref(true);
const countdown = ref(0);
const loading = ref(false);
const agreeProtocol = ref(true);
const phoneFocus = ref(false);
const passwordFocus = ref(false);
const phoneError = ref(false);
const passwordError = ref(false);

// 注册表单
const registerPhone = ref('');
const registerCode = ref('');
const registerPassword = ref('');
const registerCountdown = ref(0);
const registerLoading = ref(false);
const registerPhoneError = ref(false);
const registerCodeError = ref(false);
const registerPasswordError = ref(false);

// 忘记密码
const showForgotPassword = ref(false);
const forgotPhone = ref('');
const forgotCode = ref('');
const newPassword = ref('');
const forgotCountdown = ref(0);
const forgotLoading = ref(false);
const forgotPhoneError = ref(false);
const forgotCodeError = ref(false);
const newPasswordError = ref(false);

// 协议
const showProtocol = ref(false);
const showPrivacy = ref(false);

// 用户store
const userStore = useUserStore();

// 获取验证码
const getCode = async () => {
  if (!phone.value || phone.value.length !== 11) {
    phoneError.value = true;
    return;
  }
  phoneError.value = false;

  try {
    const [error, data] = await sendCode({
      phone: phone.value,
      type: 'login',
    });

    if (error) {
      showMessage(error.message || '发送验证码失败');
      return;
    }

    showMessage('验证码发送成功');
    countdown.value = 60;
    const timer = setInterval(() => {
      countdown.value--;
      if (countdown.value <= 0) {
        clearInterval(timer);
      }
    }, 1000);
  } catch (error) {
    showMessage('发送验证码失败');
  }
};

// 登录
const handleLogin = async () => {
  if (!phone.value || phone.value.length !== 11) {
    phoneError.value = true;
    return;
  }
  phoneError.value = false;

  if (!password.value) {
    passwordError.value = true;
    return;
  }
  passwordError.value = false;

  loading.value = true;

  try {
    const [error, data] = await login({
      phone: phone.value,
      password: password.value,
      type: isPassword.value ? 'password' : 'code',
    });

    if (error) {
      showMessage(error.message || '登录失败');
      loading.value = false;
      return;
    }

    // 存储token和用户信息到store
    userStore.setUser(data?.token || '', data?.user || {});

    showMessage('登录成功');
    loading.value = false;
    uni.switchTab({ url: '/pages/index/index' });
  } catch (error) {
    showMessage('登录失败');
    loading.value = false;
  }
};

// 获取注册验证码
const getRegisterCode = async () => {
  if (!registerPhone.value || registerPhone.value.length !== 11) {
    registerPhoneError.value = true;
    return;
  }
  registerPhoneError.value = false;

  try {
    const [error, data] = await sendCode({
      phone: registerPhone.value,
      type: 'register',
    });

    if (error) {
      showMessage(error.message || '发送验证码失败');
      return;
    }

    showMessage('验证码发送成功');
    registerCountdown.value = 60;
    const timer = setInterval(() => {
      registerCountdown.value--;
      if (registerCountdown.value <= 0) {
        clearInterval(timer);
      }
    }, 1000);
  } catch (error) {
    showMessage('发送验证码失败');
  }
};

// 注册
const handleRegister = async () => {
  if (!registerPhone.value || registerPhone.value.length !== 11) {
    registerPhoneError.value = true;
    return;
  }
  registerPhoneError.value = false;

  if (
    !registerPassword.value ||
    registerPassword.value.length < 6 ||
    registerPassword.value.length > 18
  ) {
    registerPasswordError.value = true;
    return;
  }
  registerPasswordError.value = false;

  registerLoading.value = true;

  try {
    const [error, data] = await register({
      phone: registerPhone.value,
      code: registerCode.value,
      password: registerPassword.value,
      agree: agreeProtocol.value,
    });

    if (error) {
      showMessage(error.message || '注册失败');
      registerLoading.value = false;
      return;
    }

    // 存储token和用户信息到store
    userStore.setUser(data?.token || '', data?.user || {});

    showMessage('注册成功');
    registerLoading.value = false;
    activeTab.value = 'login';
  } catch (error) {
    showMessage('注册失败');
    registerLoading.value = false;
  }
};

// 获取忘记密码验证码
const getForgotCode = async () => {
  if (!forgotPhone.value || forgotPhone.value.length !== 11) {
    forgotPhoneError.value = true;
    return;
  }
  forgotPhoneError.value = false;

  try {
    const [error, data] = await sendCode({
      phone: forgotPhone.value,
      type: 'reset',
    });

    if (error) {
      showMessage(error.message || '发送验证码失败');
      return;
    }

    showMessage('验证码发送成功');
    forgotCountdown.value = 60;
    const timer = setInterval(() => {
      forgotCountdown.value--;
      if (forgotCountdown.value <= 0) {
        clearInterval(timer);
      }
    }, 1000);
  } catch (error) {
    showMessage('发送验证码失败');
  }
};

// 重置密码
const resetPassword = () => {
  if (!forgotPhone.value || forgotPhone.value.length !== 11) {
    forgotPhoneError.value = true;
    return;
  }
  forgotPhoneError.value = false;

  if (!forgotCode.value || forgotCode.value.length !== 6) {
    forgotCodeError.value = true;
    return;
  }
  forgotCodeError.value = false;

  if (!newPassword.value || newPassword.value.length < 6 || newPassword.value.length > 18) {
    newPasswordError.value = true;
    return;
  }
  newPasswordError.value = false;

  forgotLoading.value = true;
  // 模拟重置密码成功
  setTimeout(() => {
    forgotLoading.value = false;
    showForgotPassword.value = false;
    showMessage('密码重置成功');
  }, 1000);
};

// 微信登录
const wechatLogin = () => {
  // 调用微信登录接口
  showMessage('微信登录功能开发中');
};

// 支付宝登录
const alipayLogin = () => {
  // 调用支付宝登录接口
  showMessage('支付宝登录功能开发中');
};
</script>

<style scoped>
/* 自定义样式 */
.u-input__wrap {
  border-radius: 12px !important;
  height: 48px !important;
}

.u-input__input {
  font-size: 16px !important;
}

.u-button--primary {
  background: linear-gradient(
    135deg,
    var(--color-secondary),
    var(--color-secondary-dark)
  ) !important;
}

.u-button--primary:hover {
  background: linear-gradient(
    135deg,
    var(--color-secondary-dark),
    var(--color-secondary-dark)
  ) !important;
}
</style>
