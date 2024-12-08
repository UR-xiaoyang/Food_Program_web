<!-- src/components/Sidebar.vue -->
<template>
  <div class="w-64 bg-gray-100 dark:bg-gray-900 p-4">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200">聊天</h2>
      <button @click="$emit('create-chat')" class="text-blue-500 hover:text-blue-700">
        +
      </button>
    </div>
    <ul>
      <li
          v-for="chat in chats"
          :key="chat.id"
          @click="$emit('select-chat', chat.id)"
          :class="['p-2 rounded cursor-pointer mb-2', chat.id === currentChatId ? 'bg-blue-500 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-800']"
      >
        <div class="flex justify-between items-center">
          <span>{{ chat.name }}</span>
          <button @click.stop="$emit('delete-chat', chat.id)" class="text-red-500 hover:text-red-700">
            🗑️
          </button>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

const props = defineProps<{
  chats: { id: number; name: string }[];
  currentChatId: number | null;
}>();

const emit = defineEmits<{
  (e: 'select-chat', chatId: number): void;
  (e: 'create-chat'): void;
  (e: 'delete-chat', chatId: number): void;
}>();
</script>

<style scoped>
/* 根据需要添加样式 */
</style>
