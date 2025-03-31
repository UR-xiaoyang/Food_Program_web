<!-- src/components/Sidebar.vue -->
<template>
  <div class="sidebar w-64 bg-gray-800 text-white p-4 flex flex-col">
    <h3 class="text-lg font-semibold mb-4">聊天列表</h3>
    <button @click="createChatInternal" class="mb-4 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
      新建聊天
    </button>
    <div class="chat-list flex-grow overflow-y-auto">
      <!-- 修改: 遍历 componentProps.chats -->
      <div
        v-for="chat in componentProps.chats"
        :key="chat.id"
        @click="selectChatInternal(chat.id)"
        class="flex justify-between items-center p-2 rounded hover:bg-gray-700 cursor-pointer"
        :class="{ 'bg-gray-600': chat.id === componentProps.currentChatId }"
      >
        <span class="truncate">{{ chat.name }}</span>
        <button @click.stop="deleteChatInternal(chat.id)" class="text-red-500 hover:text-red-400 ml-2 text-xs">删除</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 移除未使用的 ref 和 computed
import { defineProps, defineEmits } from 'vue';
// Removed unused import: import PlanItem from './PlanItem.vue';

const emit = defineEmits(['select-chat', 'delete-chat', 'create-chat']);

// componentProps 仍然被模板隐式使用
const componentProps = defineProps({
  chats: {
    type: Array as () => { id: number, name: string }[],
    required: true
  },
  currentChatId: {
    // 保持与 Chat.vue 传递一致，允许 undefined
    type: Number as () => number | undefined,
    default: undefined
  }
});

// 创建内部函数来触发 emit，避免未使用变量警告
const selectChatInternal = (id: number) => {
  emit('select-chat', id);
};

const deleteChatInternal = (id: number) => {
  // 可选：添加确认对话框
  if (confirm(`确定要删除聊天 "${componentProps.chats.find(c => c.id === id)?.name}" 吗?`)) {
    emit('delete-chat', id);
  }
};

const createChatInternal = () => {
  // 直接调用 emit，因为 name 在 Chat.vue 中处理
  emit('create-chat');
};
</script>

<style scoped>
/* 根据需要添加样式 */
.sidebar {
  /* 样式可以根据需要调整 */
}
.chat-list {
  /* 列表样式 */
}
</style>
