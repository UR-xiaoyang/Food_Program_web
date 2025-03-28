<!-- src/components/Chat.vue -->
<template>
  <div class="h-screen flex bg-background text-primary-foreground">
    <Sidebar
        :chats="chats"
        :currentChatId="currentChatId"
        @select-chat="selectChat"
        @create-chat="createChat"
        @delete-chat="deleteChat"
    />
    <MainArea
        :messages="currentMessages"
        :isLoading="isLoading"
        @send-message="handleSendMessage"
        :canSend="!isLoading && currentChatId !== null"
        :chats="chats"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import Sidebar from './Sidebar.vue';
import MainArea from './MainArea.vue';
import { sendMessageStream } from '../../API_connect';
import { parsePlan, Plan } from './planParser'; // 确保正确导入 parsePlan 和 Plan

interface Message {
  id: number;
  sender: 'me' | 'other';
  type: 'text' | 'plan';
  avatar?: string;
  text: string;
}

const chats = ref<{ id: number; name: string }[]>([]);
const currentChatId = ref<number | null>(null);
const messages = ref<Record<number, Message[]>>({});

const loadAllData = () => {
  const savedChats = localStorage.getItem('chats');
  if (savedChats) {
    chats.value = JSON.parse(savedChats);
    chats.value.forEach(chat => {
      const savedMessages = localStorage.getItem(`chat_messages_${chat.id}`);
      if (savedMessages) {
        messages.value[chat.id] = JSON.parse(savedMessages);
      } else {
        messages.value[chat.id] = [];
      }
    });
  }
};

const selectChat = (chatId: number) => {
  currentChatId.value = chatId;
};

const createChat = () => {
  const existingNewChat = chats.value.find(
      chat => chat.name === 'New Chat' && messages.value[chat.id].length === 0
  );
  if (existingNewChat) {
    currentChatId.value = existingNewChat.id;
    return;
  }

  const newChatId = Date.now();
  const newChat = {
    id: newChatId,
    name: 'New Chat',
  };
  chats.value.push(newChat);
  messages.value[newChatId] = [];

  saveChats();
  currentChatId.value = newChatId;
};

const deleteChat = (chatId: number) => {
  chats.value = chats.value.filter(chat => chat.id !== chatId);
  delete messages.value[chatId];
  saveChats();
  localStorage.removeItem(`chat_messages_${chatId}`);

  if (currentChatId.value === chatId) {
    currentChatId.value = chats.value.length > 0 ? chats.value[0].id : null;
  }
};

const currentMessages = computed(() => {
  return currentChatId.value ? messages.value[currentChatId.value] : [];
});

const saveChats = () => {
  localStorage.setItem('chats', JSON.stringify(chats.value));
};

const saveCurrentMessages = () => {
  if (currentChatId.value !== null) {
    localStorage.setItem(
        `chat_messages_${currentChatId.value}`,
        JSON.stringify(messages.value[currentChatId.value])
    );
  }
};

const isLoading = ref(false);

// 修改 handleSendMessage 函数以接受包含 text 和 type 的对象
const handleSendMessage = async (message: { text: string; type: 'text' | 'plan' }) => {
  if (!message.text.trim()) return;

  if (currentChatId.value === null) return;

  // 添加用户消息
  const userMessage: Message = {
    id: Date.now(),
    text: message.text.trim(),
    sender: 'me',
    avatar: 'https://placehold.co/40?text=User',
    type: message.type,
  };
  messages.value[currentChatId.value].push(userMessage);
  saveCurrentMessages();

  // 如果是第一条消息且聊天名称为“New Chat”，更新聊天名称
  if (
      messages.value[currentChatId.value].length === 1 &&
      chats.value.find(chat => chat.id === currentChatId.value)?.name === 'New Chat'
  ) {
    const currentChat = chats.value.find(chat => chat.id === currentChatId.value);
    if (currentChat) {
      currentChat.name = message.text.trim();
      saveChats();

      // 自动创建一个新的“New Chat”以备下次使用
      const newChatId = Date.now() + 1; // 确保唯一性
      const newChat = {
        id: newChatId,
        name: 'New Chat',
      };
      chats.value.push(newChat);
      messages.value[newChatId] = [];
      saveChats();
    }
  }

  isLoading.value = true;

  try {
    const userRoleMessage = {
      role: 'user',
      content: message.text.trim(),
    };

    const reader = await sendMessageStream('/user/glm', {
      messages: JSON.stringify([
        ...currentMessages.value.map((msg) => ({
          role: msg.sender === 'me' ? 'user' : 'assistant',
          content: msg.text,
        })),
        userRoleMessage,
      ]),
    });

    const decoder = new TextDecoder('utf-8');
    let aiResponse = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      aiResponse += chunk;
    }

    console.log('AI 消息全文:', aiResponse);

    // 使用正则表达式提取@plan[...]nalp@块
    const planRegex = /@plan\[(.*?)\]nalp@/gs;
    let match;
    let lastIndex = 0;
    const newMessages: Message[] = [];

    while ((match = planRegex.exec(aiResponse)) !== null) {
      const [planContent] = match;
      const start = match.index;
      const end = planRegex.lastIndex;

      // 提取@plan[...]之前的文本
      if (start > lastIndex) {
        const textBeforePlan = aiResponse.substring(lastIndex, start).trim();
        if (textBeforePlan) {
          newMessages.push({
            id: Date.now() + Math.random(),
            text: textBeforePlan.replace(/\n/g, '\n'), // 确保换行符被保留
            sender: 'other',
            avatar: 'https://placehold.co/40?text=AI',
            type: 'text',
          });
        }
      }

      // 处理@plan[...]块
      const fullPlanString = `@plan[${planContent}]nalp@`;
      try {
        console.log('计划字符串:', fullPlanString); // 调试日志
        const rawPlan = parsePlan(fullPlanString);
        const parsedPlan: Plan = {
          title: rawPlan.title,
          time: rawPlan.time,
          content: rawPlan.content,
          id: rawPlan.id,
        };
        console.log(`解析 Plan 成功`, parsedPlan);
        // 创建计划消息
        newMessages.push({
          id: Date.now() + Math.random(),
          text: JSON.stringify(parsedPlan, null, 2), // 格式化 JSON
          sender: 'other',
          avatar: 'https://placehold.co/40?text=AI',
          type: 'plan',
        });
      } catch (error: any) {
        console.error('Plan 解析失败:', error.message);
        // 创建解析错误的计划消息
        const errorPlan: Plan = {
          title: '解析错误',
          time: '',
          content: [],
          id: '',
        };
        newMessages.push({
          id: Date.now() + Math.random(),
          text: JSON.stringify(errorPlan, null, 2),
          sender: 'other',
          avatar: 'https://placehold.co/40?text=AI',
          type: 'plan',
        });
        // 添加错误提示文本消息
        newMessages.push({
          id: Date.now() + Math.random(),
          text: '抱歉，无法解析您的计划内容。',
          sender: 'other',
          avatar: 'https://placehold.co/40?text=AI',
          type: 'text',
        });
      }

      lastIndex = end;
    }

    // 处理最后剩余的文本
    const remainingText = aiResponse.substring(lastIndex).trim();
    if (remainingText) {
      newMessages.push({
        id: Date.now() + Math.random(),
        text: remainingText.replace(/\n/g, '\n'), // 确保换行符被保留
        sender: 'other',
        avatar: 'https://placehold.co/40?text=AI',
        type: 'text',
      });
    }

    // 将新解析的消息添加到聊天中
    newMessages.forEach(msg => {
      messages.value[currentChatId.value || 0].push(msg);
    });

    saveCurrentMessages();

  } catch (error) {
    console.error('发送消息时出错:', error);
  } finally {
    isLoading.value = false;
  }
};

// 初始化
onMounted(() => {
  loadAllData();
  if (chats.value.length > 0) {
    selectChat(chats.value[0].id);
  }
});
</script>

<style scoped>
/* 根据需要添加样式 */
</style>
