<template>
  <div class="sidebar">
    <div class="menu">
      <router-link to="/user_center" class="no-underline">
        <div
            class="menu-item"
            :class="{ active: activeItem === 'user' }"
            @mouseover="hover = 'user'"
            @mouseleave="hover = ''"
            @click="goTo('user')">
          <i class="icon-notification"></i>
          <span>个人信息</span>
        </div>
      </router-link>

      <router-link to="/user_center/notice" class="no-underline">
        <div
            class="menu-item"
            :class="{ active: activeItem === 'notifications' }"
            @mouseover="hover = 'notifications'"
            @mouseleave="hover = ''"
            @click="goTo('notifications')">
          <i class="icon-calendar"></i>
          <span>通知</span>
          <span class="badge" v-if="unreadCount">{{ unreadCount }}</span>
        </div>
      </router-link>

      <div
          class="menu-item"
          :class="{ active: activeItem === 'plans' }"
          @mouseover="hover = 'plans'"
          @mouseleave="hover = ''"
          @click="goTo('plans')">
        <i class="icon-calendar"></i>
        <span>计划</span>
      </div>

      <div
          class="menu-item"
          :class="{ active: activeItem === 'nutrition' }"
          @mouseover="hover = 'nutrition'"
          @mouseleave="hover = ''"
          @click="goTo('nutrition')">
        <i class="icon-food"></i>
        <span>营养分析</span>
      </div>
    </div>

    <div class="profile">
      <div class="avatar-container">
        <img :src="user.avatar" alt="User Avatar" class="avatar" />
      </div>
      <span>{{ greeting }} {{ user.name }}</span>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      user: {
        name: '用户姓名',
        avatar: 'avatar-url.jpg',
      },
      unreadCount: 5,
      hover: '',
      activeItem: 'user',  // 默认选中 "个人信息"
      greeting: this.getGreeting(), // 计算问候语
    };
  },
  methods: {
    getGreeting() {
      const hour = new Date().getHours();
      if (hour < 6) {
        return '晚上好';
      } else if (hour < 12) {
        return '早上好';
      } else if (hour < 18) {
        return '下午好';
      } else {
        return '晚上好';
      }
    },
    goTo(section) {
      this.activeItem = section; // 更新选中的菜单项
      console.log(`Navigating to ${section}`);
    },
  },
};
</script>

<style scoped>
.sidebar {
  width: 250px;
  background: linear-gradient(135deg, rgba(44, 62, 80, 0.8), rgba(52, 152, 219, 0.8));
  backdrop-filter: blur(10px);
  color: white;
  padding: 20px;
  display: flex;
  flex-direction: column;
  height: 100vh;
  justify-content: space-between;
  border-right: 1px solid rgba(255, 255, 255, 0.2);
}

.menu {
  flex-grow: 1;
  margin-bottom: 20px;
}

/* 禁用 router-link 下的下划线 */
.no-underline {
  text-decoration: none;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s ease;
  color: white; /* Keep the text color white for all items */
}

.menu-item:hover {
  background-color: rgba(255, 255, 255, 0.15);
  transform: translateY(-4px);
}

.menu-item i {
  font-size: 20px;
  margin-right: 15px;
}

.menu-item span {
  font-size: 16px;
  font-weight: 500;
  transition: color 0.3s;
}

/* Active item styling */
.menu-item.active {
  background-color: rgba(255, 255, 255, 0.25); /* Change only background */
}

.menu-item.active span {
  color: white; /* Keep text color white */
}

.badge {
  background-color: #e74c3c;
  color: white;
  border-radius: 50%;
  padding: 4px 8px;
  margin-left: auto;
  font-size: 12px;
}

.profile {
  display: flex;
  align-items: center;
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.avatar-container {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #fff;
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.2);
}

.profile span {
  font-size: 14px;
  font-weight: 400;
}

@media (max-width: 768px) {
  .sidebar {
    width: 200px;
    padding: 15px;
  }

  .menu-item {
    padding: 10px 12px;
  }

  .avatar {
    width: 35px;
    height: 35px;
  }
}
</style>
