<!-- src/components/MainArea.vue -->
<template>
  <div class="flex flex-col flex-1">
    <!-- 消息区域 -->
    <div class="flex-1 overflow-y-auto p-4" ref="messagesContainer">
      <div
          v-for="message in messages"
          :key="message.id"
          :class="['mb-4', message.sender === 'me' ? 'flex justify-end' : 'flex items-start']"
      >
        <div v-if="message.sender === 'other'" class="flex items-center">
          <img :src="message.avatar" alt="AI" class="w-10 h-10 rounded-full mr-2" />
          <div
              v-if="message.type === 'plan' && getPlan(message)"
              class="bg-secondary text-secondary-foreground p-3 rounded-lg max-w-full shadow-lg break-words"
          >
            <Timeline
                :title="(getPlan(message)?.title) || '计划'"
                :plan_time="(getPlan(message)?.time) || '无时间信息'"
                :content="(getPlan(message)?.content) || []"
                :id="(getPlan(message)?.id) || ''"
            />
          </div>
          <div
              v-else-if="message.type === 'plan' && !getPlan(message)"
              class="bg-secondary text-secondary-foreground p-3 rounded-lg max-w-full shadow-lg break-words"
          >
            <p class="text-red-500 whitespace-pre-line">计划解析失败。</p>
            <p class="whitespace-pre-line">{{ message.text }}</p>
          </div>
          <div
              v-else-if="message.type === 'text'"
              class="bg-secondary text-secondary-foreground p-3 rounded-lg max-w-xs shadow-lg break-words whitespace-pre-line"
          >
            <p>{{ message.text }}</p>
          </div>
        </div>
        <div v-else class="bg-primary text-primary-foreground p-3 rounded-lg max-w-xs shadow-lg break-words whitespace-pre-line">
          <p>{{ message.text }}</p>
        </div>
      </div>
      <!-- 如果没有当前聊天，显示提示信息 -->
      <div v-if="!canSend && messages.length === 0" class="flex justify-center items-center h-full">
        <p>请创建一个新的对话并发送第一条消息。</p>
      </div>
    </div>

    <!-- 加载状态显示 -->
    <div v-if="isLoading" class="flex justify-center items-center p-4">
      <span>AI 正在思考... 请稍候。</span>
    </div>

    <!-- 输入区域 -->
    <div class="p-4 border-t border-gray-200">
      <div class="flex">
        <input
            type="text"
            v-model="newMessage"
            @keyup.enter="handleSendMessage"
            :disabled="!canSend"
            placeholder="输入消息..."
            class="flex-1 p-2 mr-2 bg-gray-100 text-gray-900 rounded-lg shadow focus:outline-none focus:ring focus:ring-blue-400"
        />
        <button
            @click="handleSendMessage"
            :disabled="!canSend"
            class="bg-blue-500 text-white p-2 rounded-lg shadow hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          发送
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import Timeline from './Timeline.vue'; // 引入 Timeline 组件

interface Message {
  id: number;
  sender: 'me' | 'other';
  type: 'text' | 'plan';
  avatar?: string;
  text: string;
}

interface Plan {
  title: string;
  time: string;
  content: string[];
  id: string;
}

// 接收的 props
const props = defineProps<{
  messages: Message[];
  isLoading: boolean;
  canSend: boolean;
  chats: any[]; // 根据实际情况定义
}>();

// 触发的事件
const emit = defineEmits<{
  (e: 'send-message', message: { text: string; type: 'text' | 'plan' }): void;
}>();

const newMessage = ref('');

// 处理发送消息
const handleSendMessage = () => {
  if (newMessage.value.trim()) {
    const isPlan = newMessage.value.trim().startsWith('@plan[');
    emit('send-message', {
      text: newMessage.value.trim(),
      type: isPlan ? 'plan' : 'text'
    });
    newMessage.value = '';
  }
};

// 监听消息变化，确保消息区域滚动到底部
watch(
    () => props.messages,
    () => {
      nextTick(() => {
        if (messagesContainer.value) {
          messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
        }
      });
    },
    { immediate: true, deep: true }
);

const messagesContainer = ref<HTMLElement | null>(null);

// 解析计划内容
const getPlan = (message: Message): Plan | null => {
  if (message.type !== 'plan') return null;
  try {
    const plan: Plan = JSON.parse(message.text);
    return plan;
  } catch (error) {
    console.error('解析 Plan JSON 失败:', error);
    return null;
  }
};
</script>

<style scoped>
/* 确保输入框始终固定在底部 */
.flex-1 {
  display: flex;
  flex-direction: column;
}

/* 确保消息区域不受内容影响 */
.overflow-y-auto {
  max-height: calc(100vh - 200px); /* 根据需要调整 */
}

/* 处理消息内容的换行 */
.whitespace-pre-line {
  white-space: pre-line;
}

.break-words {
  word-break: break-word;
}
</style>
