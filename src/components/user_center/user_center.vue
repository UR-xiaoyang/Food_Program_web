<template>
  <div class="personal-center">
    <left_list />
    <div class="content">
      <router-view /> <!-- 显示路由内容 -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, defineEmits } from 'vue'; // 引入 defineEmits
import left_list from "./left_list.vue";
import { onBeforeRouteLeave } from 'vue-router'; // 引入路由相关

// 修改：确保 emit 被定义，即使 toggleHeader 被移除
const emit = defineEmits(['toggle-header', 'toggle-bottom-bar']);

// 移除未使用的 toggleHeader 函数
// const toggleHeader = () => {
//   emit('toggle-header'); // 通知父组件切换头部
//   show_header.value = !show_header.value; // 切换显示状态
// };

const toggleBottomBar = () => {
  emit('toggle-bottom-bar'); // 触发事件来通知父组件切换底部栏
};

// 修改：添加下划线前缀
onBeforeRouteLeave((_to, _from, next) => {
  // 在离开当前路由前执行的逻辑
  toggleBottomBar(); // 加载底栏
  next();
});

onMounted(() => {
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
