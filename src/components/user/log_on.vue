<template>
  <div class="login-background">
    <div class="frosted-glass-container">
      <div class="login-container">
        <h2 class="login-title">登录</h2>
        <form @submit.prevent="handleLogin">
          <div v-if="showEmailField" class="form-group">
            <label for="username">用户名</label>
            <input
                type="text"
                id="username"
                v-model="username"
                required
                placeholder="请输入您的用户名"
                @input="handleEmailInput"
            />
          </div>
          <p v-if="showRegisterText && !showPasswordField" class="register-link">
            还没有账号？<a href="#register" @click.prevent="goToRegister">立即注册</a>
          </p>
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

          <!-- 2FA 动态密码输入框 -->
          <div v-if="showTwoFaField" class="form-group">
            <label for="twoFaCode">动态验证码</label>
            <input
                type="text"
                id="twoFaCode"
                v-model="twoFaCode"
                required
                placeholder="请输入动态验证码"
                @input="handleTwoFaInput"
            />
          </div>

          <button v-if="showLoginButton" type="submit" class="cta-button">登录</button>
        </form>
        <p class="error-message" v-if="errorMessage">{{ errorMessage }}</p>
        <p class="success-message" v-if="successMessage">{{ successMessage }}</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { api } from "../../API_connect.ts";

const router = useRouter();
const username = ref('');
const password = ref('');
const twoFaCode = ref('');
const showEmailField = ref(true);
const showRegisterText = ref(true);
const showPasswordField = ref(false);
const showLoginButton = ref(false);
const showTwoFaField = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

// 从 provide 注入登录状态
// const isLoggedIn = inject('isLoggedIn');
// const globalUsername = inject('username');

const handleEmailInput = () => {
  if (username.value.trim()) {
    showPasswordField.value = true;
    showLoginButton.value = false;
  } else {
    showPasswordField.value = false;
    showLoginButton.value = false;
  }
};

const handlePasswordInput = () => {
  if (password.value.trim()) {
    showTwoFaField.value = true;
  } else {
    showTwoFaField.value = false;
    showLoginButton.value = false;
  }
};

const handleTwoFaInput = () => {
  if (twoFaCode.value.trim()) {
    showLoginButton.value = true;
  } else {
    showLoginButton.value = false;
  }
};

// 登录逻辑
const handleLogin = async () => {
  console.log('登录请求被触发'); // 确认函数被调用
  const loginData = {
    用户名: username.value,
    密码: password.value,
    two_fa: twoFaCode.value, // 将 2FA 动态密码加入请求数据中
  };

  try {
    const response = await api.post("/user/sign_in", loginData);
    console.log("服务器响应:", response.data); // 打印完整响应

    if (response.data.error) {
      console.error('登录失败:', response.data.error);
      errorMessage.value = `登录失败 ${response.data.error}`;
    } else {
      console.log('登录成功:', response.data);
      successMessage.value = '登录成功！';

      // 存储用户数据到 cookie
      document.cookie = `username=${response.data.username}; path=/;`;
      document.cookie = `token=${response.data.access_token}; path=/;`;

      // 跳转
      router.push('/');
      // 刷新后跳转到主页
      setTimeout(() => {
        window.location.reload();
      }, 100); // 设置一个很小的延时确保页面刷新完成后跳转
    }
  } catch (error) {
    console.error('请求出错:', error);
    // 修改：添加类型检查
    if (error instanceof Error) {
      errorMessage.value = `请求出错：${error.message}`;
    } else {
      errorMessage.value = `发生未知错误`;
    }
  }
};

const goToRegister = () => {
  router.push('/register');
};
</script>

<style scoped lang="scss">
@import url('../../css/user/log_on.scss');
</style>
