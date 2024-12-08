<!-- src/components/Timeline.vue -->
<template>
  <div class="w-full max-w-2xl mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
    <div class="p-6">
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-4">{{ title }}</h2>
      <time class="block mb-4 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">
        <Clock class="inline-block w-4 h-4 mr-1" />
        {{ plan_time }}
      </time>
      <div class="px-4 overflow-y-auto">
        <ol class="relative border-l border-gray-200 dark:border-gray-700">
          <li v-for="(item, index) in content" :key="index" class="mb-10 ml-6">
            <span class="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -left-3 ring-8 ring-white dark:ring-gray-900 dark:bg-blue-900">
              <CheckCircle2 class="w-3 h-3 text-blue-800 dark:text-blue-300" />
            </span>
            <h3 class="flex items-center mb-1 text-lg font-semibold text-gray-900 dark:text-white whitespace-pre-line">
              {{ index + 1 }}. {{ item }}
            </h3>
            <!-- 如果需要，可以在这里添加更多信息 -->
          </li>
        </ol>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
import { CheckCircle2, Clock } from 'lucide-vue-next';

export interface Plan {
  title: string;
  time: string;
  content: string[];
  id: string;
}

const props = defineProps<{
  title: string;
  plan_time: string;
  content: string[];
  id: string;
}>();
</script>

<style scoped>
/* 处理换行符 */
.whitespace-pre-line {
  white-space: pre-line;
}

.break-words {
  word-break: break-word;
}
</style>
