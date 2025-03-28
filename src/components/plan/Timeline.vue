<!-- src/components/Timeline.vue -->
<!-- 这是计划展示器 -->
<!-- 计划时间线组件 -->
<template>
  <!-- 主容器 -->
  <div class="w-full max-w-2xl mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
    <div class="p-6">
      <!-- 标题和操作按钮容器 -->
      <div class="flex justify-between items-start mb-4">
        <h2 class="text-2xl font-semibold text-gray-900 dark:text-white">{{ title }}</h2>
        <button 
          @click="joinPlan"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 dark:bg-blue-800 dark:hover:bg-blue-900"
        >
          加入计划
        </button>
      </div>

      <!-- 计划时间显示 -->
      <time class="block mb-4 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">
        <Clock class="inline-block w-4 h-4 mr-1" />
        {{ plan_time }}
      </time>

      <!-- 时间线内容区域 -->
      <div class="px-4 overflow-y-auto">
        <ol class="relative border-l border-gray-200 dark:border-gray-700">
          <!-- 循环渲染时间线条目 -->
          <li v-for="(item, index) in content" :key="index" class="mb-10 ml-6">
            <!-- 时间线节点图标 -->
            <span class="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -left-3 ring-8 ring-white dark:ring-gray-900 dark:bg-blue-900">
              <CheckCircle2 class="w-3 h-3 text-blue-800 dark:text-blue-300" />
            </span>
            
            <!-- 条目内容 -->
            <h3 class="flex items-center mb-1 text-lg font-semibold text-gray-900 dark:text-white whitespace-pre-line">
              {{ index + 1 }}. {{ item }}
            </h3>
          </li>
        </ol>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 基础依赖导入
import { onMounted } from 'vue';
import { api } from '../../API_connect'; // 替换为项目中的axios实例
// Lucide 图标库
import { CheckCircle2, Clock } from 'lucide-vue-next';

// 计划项类型定义
export interface Plan {
  title: string;
  time: string;
  content: string[];
  id: string;
}

// 组件属性定义
const props = defineProps<{
  title: string;        // 计划标题
  plan_time: string;    // 计划时间
  content: string[];    // 计划步骤内容数组
  id: string;           // 唯一标识符
}>();

// 新增挂载时打印
onMounted(() => {
  console.log('计划组件已加载', {
    id: props.id,
    title: props.title,
    time: props.plan_time,
    steps: props.content.length,
    content: props.content
  });
  

});

// 定义组件事件
const emit = defineEmits(['join']);

// 新增加入计划方法
const joinPlan = async () => {
  try {
    console.log('正在加入计划', props.id);
    
    const sanitizedContent = props.content.map(item => 
      item.replace(/^"+|"+$/g, '')
    );

    const response = await api.post(
      '/plan/submit_plan', // 更新API端点
      {
        标题: props.title,
        时间: props.plan_time,
        计划步骤内容列表: sanitizedContent // 按新字段名传递数据
      }
    );

    console.log('加入计划成功', response.data);
    emit('join', props.id);
  } catch (error) {
    console.error('加入计划失败', error);
  }
};
</script>

<style scoped>
/* 处理换行显示 */
.whitespace-pre-line {
  white-space: pre-line;  /* 保留换行符显示 */
}

/* 长文本自动换行 */
.break-words {
  word-break: break-word; /* 防止内容溢出 */
}
</style>
