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
import { ref, onMounted, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';  // 引入 useRouter
import { api } from "../../API_connect.ts";
import Modal from "../Modal.vue";
import QRCode from "qrcode";  // 确保使用的是正确的 QRCode 库

// 引入 router
const router = useRouter();

// 数据绑定
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
const qrcodeCanvas = ref<HTMLCanvasElement | null>(null);  // 明确类型
const isModalVisible = ref(false);

// 处理输入框变化
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
/* 样式保持大部分不变，若需要，可以根据需求调整 */
.register-background {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100vh;
  background-image: url('../../assets/root_background.png');
  background-size: cover;
  background-position: center;
  backdrop-filter: blur(15px);
  padding: 20px;
}

.register-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 500px;
  padding: 30px;
  border-radius: 10px;
  background-color: rgba(128, 128, 128, 0.5);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.register-title {
  margin-bottom: 20px;
  font-size: 2rem;
  color: #ffffff;
  text-shadow: 1px 1px 5px rgba(0, 0, 0, 0.8);
}

.form-group {
  margin-bottom: 15px;
  width: 100%;
}

.form-group label {
  font-size: 1rem;
  color: #ffffff;
  text-shadow: 1px 1px 5px rgba(0, 0, 0, 0.8);
}

.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 5px;
  background-color: rgba(255, 255, 255, 0.2);
  color: #ffffff;
}

.form-group input::placeholder {
  color: rgba(255, 255, 255, 0.7);
}

.form-group input:focus {
  outline: none;
  border-color: #f39c12;
  box-shadow: 0 0 8px rgba(243, 156, 18, 0.6);
}

.cta-button {
  width: 100%;
  padding: 10px;
  background-color: #f39c12;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.cta-button:hover {
  background-color: #e67e22;
}

/* 单独定义验证码发送按钮的样式（可选） */
.send-verification-button {
  background-color: #3498db;
}

.send-verification-button:hover {
  background-color: #2980b9;
}

/* 验证码输入框样式（可选） */
.captcha-input {
  border-color: #3498db;
}

.login-link, .login-link a {
  margin-top: 15px;
  color: #ffffff;
  text-decoration: none;
  text-shadow: 1px 1px 5px rgba(0, 0, 0, 0.8);
}

.error-message {
  color: #ff4d4d;
  font-size: 0.9rem;
  font-weight: bold;
  text-shadow: 1px 1px 5px rgba(0, 0, 0, 0.8);
}

.success-message {
  color: #4caf50;
  font-size: 0.9rem;
  font-weight: bold;
  text-shadow: 1px 1px 5px rgba(0, 0, 0, 0.8);
}

/* 确保 canvas 显示正确 */
canvas {
  max-width: 100%;
  height: auto;
}
</style>
