<template>
  <div class="register-background">
    <div class="register-container">
      <h2 class="register-title">注册</h2>
      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="username">用户名</label>
          <input
              type="text"
              id="username"
              v-model="username"
              required
              placeholder="请输入您的用户名"
              @input="handleUsernameInput"
          />
        </div>

        <div v-if="showEmailField" class="form-group">
          <label for="email">电子邮件</label>
          <input
              type="email"
              id="email"
              v-model="email"
              required
              placeholder="请输入您的电子邮件"
              @input="handleEmailInput"
          />
        </div>

        <div v-if="showPasswordField" class="form-group">
          <label for="password">密码</label>
          <input
              type="password"
              id="password"
              v-model="password"
              required
              placeholder="请输入您的密码"
              @input="handlePasswordInput"
          />
        </div>

        <div v-if="showConfirmPasswordField" class="form-group">
          <label for="confirmPassword">确认密码</label>
          <input
              type="password"
              id="confirmPassword"
              v-model="confirmPassword"
              required
              placeholder="请确认您的密码"
              @input="handleConfirmPasswordInput"
          />
        </div>

        <div v-if="showVerifyButton" class="form-group">
          <button @click.prevent="sendVerificationCode" class="cta-button">发送验证码</button>
        </div>

        <div v-if="showCaptchaField" class="form-group">
          <label for="captcha">验证码</label>
          <input
              type="text"
              id="captcha"
              v-model="captcha"
              required
              placeholder="请输入验证码"
          />
        </div>

        <div v-if="showRegisterButton" class="form-group">
          <button type="submit" class="cta-button">注册</button>
        </div>

        <p class="login-link" v-if="showLoginLink">
          已有账号？<router-link to="/login" @click.prevent="goToLogin">登录</router-link>
        </p>

        <p class="error-message" v-if="errorMessage">{{ errorMessage }}</p>
        <p class="success-message" v-if="successMessage">{{ successMessage }}</p>

        <!-- 注册成功弹窗 -->
        <Modal :isVisible="isModalVisible" @close="closeModal">
          <h3>注册成功</h3>
          <p>您的账号已成功创建，您现在可以登录，请扫描您的2fa二维码，用于登录获取动态密码</p>
          <div v-if="qrcodeData">
            <canvas ref="qrcodeCanvas"></canvas>
          </div>
          <button class="cta-button" @click="closeModalAndGoToLogin">去登录</button>
        </Modal>
      </form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '../../API_connect.ts';
import Modal from '../Modal.vue';
import QRCode from 'qrcode';

const router = useRouter();

const username = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const captcha = ref('');
const showEmailField = ref(false);
const showPasswordField = ref(false);
const showConfirmPasswordField = ref(false);
const showCaptchaField = ref(false);
const showVerifyButton = ref(false);
const showRegisterButton = ref(false);
const showLoginLink = ref(true);
const errorMessage = ref('');
const successMessage = ref('');
const qrcodeData = ref('');
const qrcodeCanvas = ref<null | HTMLCanvasElement>(null);
const isModalVisible = ref(false);

// 处理输入变化
const handleUsernameInput = () => {
  if (username.value.trim()) {
    showEmailField.value = true;
  }
};


const handleEmailInput = () => {
  if (email.value.trim()) {
    showPasswordField.value = true;
  }
};


const handlePasswordInput = () => {
  if (password.value.trim()) {
    showConfirmPasswordField.value = true;
  }
};


const handleConfirmPasswordInput = () => {
  if (confirmPassword.value.trim() && showCaptchaField.value === false) {
    showVerifyButton.value = true;
  }
};


// 处理注册逻辑
const handleRegister = async () => {
  errorMessage.value = '';
  successMessage.value = '';

  if (password.value !== confirmPassword.value) {
    errorMessage.value = '密码与确认密码不匹配';
    return;
  }

  try {
    const response = await api.post("/user/sign_up", {
      用户名: username.value,
      邮箱: email.value,
      密码: password.value,
      验证码: captcha.value,
    });

    if (response.status === 200) {
      successMessage.value = `注册成功`;
      qrcodeData.value = `otpauth://totp/${encodeURIComponent(username.value)}?secret=${response.data.detail}&issuer=${encodeURIComponent("ShiCheng_plan")}`;
      isModalVisible.value = true; // 显示弹窗
      console.log("qrcodeData from response:", qrcodeData.value);
    }
  } catch (error: any) {
    if (error.response && error.response.status === 409) {
      errorMessage.value = `注册失败：${error.response.data.detail}`;
    } else {
      errorMessage.value = `请求出错：${error.message}`;
    }
  }
};

// 生成二维码
const generateQRCode = async () => {
  if (qrcodeData.value && qrcodeCanvas.value) {
    try {
      await QRCode.toCanvas(qrcodeCanvas.value, qrcodeData.value, {
        width: 200,
        margin: 2,
      });
    } catch (error) {
      console.error('无法生成二维码:', error);
    }
  } else {
    console.warn("Cannot generate QR code. qrcodeData or qrcodeCanvas is missing.");
  }
};

// 监听 isModalVisible 和 qrcodeData，确保在弹窗打开后生成二维码
watch([isModalVisible, qrcodeData], async ([isVisible, data]) => {
  console.log("isModalVisible changed:", isVisible);
  console.log("qrcodeData changed:", data);

  if (isVisible && data) {
    await nextTick();  // 确保 DOM 已经更新
    generateQRCode();
  }
});

// 发送验证码
const sendVerificationCode = async () => {
  errorMessage.value = '';
  successMessage.value = '';

  try {
    const response = await api.post(`/user/mail_code?邮箱=${encodeURIComponent(email.value)}`);
    if (response.status === 200) {
      successMessage.value = '验证码已发送，请检查您的邮箱';
      showCaptchaField.value = true;
      showRegisterButton.value = true;
      showVerifyButton.value = false;
    } else {
      errorMessage.value = '无法发送验证码，请重试';
    }
  } catch (error: any) {
    if (error.response && error.response.status === 403) {
      errorMessage.value = '请一分钟后再次尝试';
    } else {
      errorMessage.value = `请求出错：${error.message}`;
    }
  }
};

// 关闭弹窗
const closeModal = () => {
  isModalVisible.value = false;
};

// 关闭弹窗并跳转到登录页面
const closeModalAndGoToLogin = () => {
  closeModal();
  goToLogin();
};

// 跳转到登录页面
const goToLogin = () => {
  router.push('/login');
};
</script>

<style scoped lang="scss">
@import url('../../css/user/register.scss');
</style>
