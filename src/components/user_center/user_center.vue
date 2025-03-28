<template>
  <div class="personal-center" @mousemove="checkMousePosition">
    <left_list />
    <div class="content">
      <router-view /> <!-- 显示路由内容 -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import left_list from "./left_list.vue";
import { useRoute, onBeforeRouteLeave } from 'vue-router'; // 引入路由相关

const emit = defineEmits();
const show_header = ref(false); // 使用 ref 来保持响应性

const toggleHeader = () => {
  emit('toggle-header'); // 通知父组件切换头部
  show_header.value = !show_header.value; // 切换显示状态
};

const checkMousePosition = (event: MouseEvent) => {
  if (event.clientY <= 0) {
    // 鼠标在顶部时触发
    if (show_header.value) {
      toggleHeader(); // 切换头部显示
    }
  } else if (event.clientY > 0 && !show_header.value) {
    // 鼠标在区域内且头部隐藏时触发
    toggleHeader(); // 切换头部显示
  }
};

const toggleBottomBar = () => {
  emit('toggle-bottom-bar'); // 触发事件来通知父组件切换底部栏
};

onBeforeRouteLeave((to, from, next) => {
  // 在离开当前路由前执行的逻辑
  toggleBottomBar(); // 加载底栏
  next();
});

onMounted(() => {
  toggleHeader(); // 在组件挂载时触发一次头部切换
  toggleBottomBar(); // 不加载底栏
});
</script>

<style scoped lang="scss">
.personal-center {
  display: flex; /* 使用 Flexbox 布局 */
  flex: 1; /* 让 personal-center 自适应剩余空间 */
  background-color: #f0f0f0; /* 背景颜色 */
  background-image: url('../../assets/00163-1394585913_compressed.png'); /* 背景图片路径 */
  background-size: cover; /* 背景图像覆盖整个区域 */
  background-position: center; /* 背景图像居中 */
}

.content {
  flex: 1; /* 使内容区域自适应宽度 */
  padding: 20px; /* 内容内边距 */
  background-color: rgba(255, 255, 255, 0.9); /* 内容区域背景颜色 */
  border-radius: 8px; /* 可选：内容区域圆角 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); /* 可选：阴影效果 */
  overflow-y: auto; /* 允许内容区域垂直滚动 */
}

.title {
  margin-bottom: 20px;
  font-size: 1.5rem; /* 标题大小 */
  color: #333; /* 标题颜色 */
}

.footer-text {
  margin-top: 20px;
  font-size: 0.9rem; /* 底部文本大小 */
  color: #666; /* 底部文本颜色 */
  text-align: center; /* 居中对齐 */
}
</style>
