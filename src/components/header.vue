<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

// 工具函数：获取和删除 Cookie
const getCookie = (name: string): string | null => {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
};

const deleteCookie = (name: string) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

// 状态变量
const isLoggedIn = ref(false);
const username = ref('');
const router = useRouter();

// 检查登录状态
onMounted(() => {
  const token = getCookie('token');
  const user = getCookie('username');

  if (token && user) {
    isLoggedIn.value = true;
    username.value = decodeURIComponent(user);
  }
});

// 登出逻辑
const handleLogout = () => {
  deleteCookie('token');
  deleteCookie('username');
  isLoggedIn.value = false;
  username.value = '';
  router.push('/');
};

// 锚点跳转逻辑 (已移除)
// const showSection = (sectionId: string) => {
//   const section = document.getElementById(sectionId);
//   if (section) {
//     section.scrollIntoView({ behavior: 'smooth' });
//   }
// };
</script>

<template>
  <header>
    <div class="header-container">
      <!-- Logo -->
      <div class="logo">食程计划</div>

      <!-- 导航栏 -->
      <nav>
        <ul>
          <li><router-link to="/">首页</router-link></li>
          <li><router-link to="/plan">计划</router-link></li>
          <li><router-link to="/planList">计划列表</router-link></li>
          <li><router-link to="/nutrition">营养分析</router-link></li>
          <li><router-link to="/user_center">个人中心</router-link></li>
        </ul>
      </nav>

      <!-- 用户信息或登录注册 -->
      <div class="auth-links">
        <template v-if="!isLoggedIn">
          <router-link to="/login">登录</router-link>
          <router-link to="/register">注册</router-link>
        </template>
        <template v-else>
          <span>欢迎, {{ username }}</span>
          <a href="#logout" @click.prevent="handleLogout">登出</a>
        </template>
      </div>
    </div>
  </header>
</template>

<style scoped lang="scss">
.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background-color: #333;
  color: white;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
}

nav ul {
  display: flex;
  list-style: none;
  gap: 20px;
}

nav ul li a,
nav ul li router-link {
  color: white;
  text-decoration: none;
  transition: color 0.3s;
}

nav ul li a:hover,
nav ul li router-link:hover,
nav ul li .router-link-active {
  color: #f39c12;
  font-weight: bold;
}

.auth-links {
  display: flex;
  gap: 15px;
}

.auth-links a,
.auth-links router-link {
  color: white;
  text-decoration: none;
  transition: color 0.3s;
}

.auth-links a:hover,
.auth-links router-link:hover {
  color: #f39c12;
}

/* 小屏幕适配 */
@media (max-width: 768px) {
  .header-container {
    flex-direction: column;
    align-items: flex-start;
  }

  nav ul {
    flex-direction: column;
    gap: 10px;
  }

  .auth-links {
    flex-direction: column;
    gap: 10px;
  }
}
</style>
