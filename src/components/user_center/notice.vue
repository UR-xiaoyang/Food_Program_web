<template>
  <div class="mx-auto rounded-lg bg-white p-4 shadow-md">
    <div class="marquee h-8">
      <div class="marquee-content">最新消息：你有一条新的消息来自Alice，欢迎查看通知中心！</div>
    </div>
    <h1 class="mb-4 text-center text-2xl font-semibold">通知中心</h1>
    <div class="flex flex-col space-y-4">
      <div
          class="flex w-full items-start border-b border-gray-200 p-3"
          v-for="notification in notifications"
          :key="notification.id"
      >
        <div class="mr-3 text-3xl">{{ notification.icon }}</div>
        <div class="flex-1">
          <h2 class="text-lg font-bold">{{ notification.title }}</h2>
          <p class="text-gray-700">{{ notification.message }}</p>
          <span class="text-xs text-gray-500">{{ notification.timestamp }}</span>
        </div>
        <button
            class="ml-4 text-red-600 hover:text-red-800"
            @click="deleteNotification(notification.id)"
        >
          删除
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      notifications: [
        { id: 1, icon: '🔔', title: '新消息', message: '你有一条新的消息来自Alice。', timestamp: '2024年11月2日' },
        { id: 2, icon: '🗓️', title: '日程提醒', message: '你今天有一个会议安排。', timestamp: '2024年11月2日' },
        { id: 3, icon: '🗓️', title: '日程提醒', message: '你今天有一个会议安排。', timestamp: '2024年11月2日' },
        { id: 4, icon: '🗓️', title: '日程提醒', message: '你今天有一个会议安排。', timestamp: '2024年11月2日' },
        { id: 5, icon: '🗓️', title: '日程提醒', message: '你今天有一个会议安排。', timestamp: '2024年11月2日' },
        { id: 6, icon: '🗓️', title: '日程提醒', message: '你今天有一个会议安排。', timestamp: '2024年11月2日' },
        // 可以添加更多通知
      ],
    };
  },
  methods: {
    async deleteNotification(id) {
      this.notifications = this.notifications.filter(notification => notification.id !== id);
      // 发送删除请求到后端
      try {
        const response = await fetch(`https://your-backend-api.com/notifications/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          // 从前端删除通知
          this.notifications = this.notifications.filter(notification => notification.id !== id);
        } else {
          console.error('删除通知失败');
        }
      } catch (error) {
        console.error('请求错误:', error);
      }
    },
  },
};
</script>

<style scoped>
@import "../../css/tailwindcss.css";
.marquee {
  overflow: hidden;
  white-space: nowrap;
  box-sizing: border-box;
}
.marquee-content {
  display: inline-block;
  animation: marquee 10s linear infinite;
}
@keyframes marquee {
  0% { transform: translateX(100%); }
  100% { transform: translateX(-100%); }
}
</style>
