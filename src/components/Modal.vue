<template>
  <div v-if="modelValue" class="modal-overlay" @click.self="close"> <!-- 添加点击遮罩层关闭 -->
    <div class="modal-content">
      <button class="close-button" @click="close">×</button>
      <slot name="content"></slot>
      <div class="modal-actions">
        <!-- 添加取消按钮 -->
        <button class="cancel-button" @click="close">取消</button>
        <!-- 修改确认按钮文本 -->
        <button class="confirm-button" @click="confirm">确认</button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  }
});

const emit = defineEmits(['update:modelValue', 'confirm']);

const close = () => {
  emit('update:modelValue', false);
};

const confirm = () => {
  emit('confirm'); // 触发 confirm 事件，让 Timeline.vue 执行 confirmJoin
  // 确认后也关闭弹窗 - 取消这行代码的注释
  emit('update:modelValue', false); // 触发 update:modelValue 事件，将 Timeline.vue 中的 showModal 设为 false
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  position: relative;
  max-width: 400px;
  width: 100%;
}

.close-button {
  position: absolute;
  top: 10px;
  right: 10px;
  background: transparent;
  border: none;
  font-size: 20px;
  cursor: pointer;
}

.modal-actions {
  display: flex;
  justify-content: flex-end; /* 将按钮靠右对齐 */
  gap: 10px; /* 添加按钮间距 */
  margin-top: 20px;
}

/* 添加取消按钮样式 (可以根据需要调整) */
.cancel-button {
  padding: 8px 16px;
  background-color: #f3f4f6; /* 灰色背景 */
  color: #1f2937; /* 深灰色文字 */
  border: 1px solid #d1d5db; /* 边框 */
  border-radius: 4px;
  cursor: pointer;
}

.cancel-button:hover {
  background-color: #e5e7eb; /* 悬停时变深 */
}

.confirm-button {
  padding: 8px 16px;
  background-color: #2563eb; /* 蓝色背景 (匹配加入计划按钮) */
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.confirm-button:hover {
  background-color: #1d4ed8; /* 悬停时变深 */
}
</style>
