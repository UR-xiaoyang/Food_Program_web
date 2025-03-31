<template>
  <div class="min-h-screen bg-gray-50">
    <main class="max-w-7xl mx-auto px-4 pt-6 pb-6 h-[calc(100vh-76px)] overflow-y-auto">
      <div class="h-[112px] bg-white shadow-sm mb-4">
        <div class="h-16 flex items-center justify-between">
          <h1 class="text-xl font-bold">我的计划</h1>
          <div class="flex items-center space-x-4">
            <button class="p-2 hover:bg-gray-100 rounded-full">
              <i class="fas fa-search text-gray-600"></i>
            </button>
            <button @click="fetchPlans(true)" class="px-4 py-2 bg-green-500 text-white rounded">刷新</button>
            <!-- 新增更新按钮 -->
            <button 
              @click="updatePlanContents" 
              :disabled="upload_list.length === 0"
              class="px-4 py-2 bg-yellow-500 text-white rounded disabled:opacity-50"
            >
              更新任务
            </button>
            <button class="!rounded-button bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 flex items-center whitespace-nowrap">
              <i class="fas fa-plus mr-2"></i>
              新建计划
            </button>
          </div>
        </div>
        <!-- 修改标签栏 -->
        <div class="flex items-center space-x-6 py-3 border-b">
          <button @click="currentTab = '进行中'" :class="{ 'text-blue-500 border-b-2 border-blue-500 pb-2': currentTab === '进行中', 'text-gray-600 pb-2': currentTab !== '进行中' }">进行中</button>
          <button @click="currentTab = '未完成'" :class="{ 'text-blue-500 border-b-2 border-blue-500 pb-2': currentTab === '未完成', 'text-gray-600 pb-2': currentTab !== '未完成' }">未完成</button>
          <button @click="currentTab = '已完成'" :class="{ 'text-blue-500 border-b-2 border-blue-500 pb-2': currentTab === '已完成', 'text-gray-600 pb-2': currentTab !== '已完成' }">已完成</button>
        </div>
      </div>

      <div class="space-y-4">
        <div v-for="plan in filteredPlans" :key="plan.id" class="bg-white rounded-lg shadow-sm p-4 flex items-start transition-all hover:shadow-md" :class="{ 'border-l-4 border-yellow-500': plan.isImportant }">
          <div class="flex-1">
            <div class="flex items-center justify-between">
              <h3 class="font-semibold text-lg">{{ plan.title }}</h3>
              <span class="text-sm text-gray-500">{{ plan.date }}</span>
            </div>
            <div class="mt-3">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                  <span :class="[
                    'px-2 py-1 rounded-full text-sm',
                    plan.status === '进行中' ? 'bg-blue-100 text-blue-600' :
                    plan.status === '已完成' ? 'bg-green-100 text-green-600' :
                    'bg-gray-100 text-gray-600'
                  ]">{{ plan.status }}</span>
                </div>
              </div>
              <div class="mt-3 space-y-2">
                <div v-for="(item, index) in plan.items" :key="index" class="flex items-center space-x-3">
                  <!-- 修改 :disabled 的条件 -->
                  <input
                    type="checkbox"
                    :checked="item.completed"
                    @change="toggleItem(plan.id, index)"
                    :disabled="plan.status === '未完成' || plan.status === '已完成'"
                    class="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    :class="{ 'cursor-not-allowed': plan.status === '未完成' || plan.status === '已完成' }"
                  >
                  <span class="text-gray-600" :class="{ 'line-through': item.completed }">{{ item.content }}</span>
                </div>
              </div>
              <!-- Add Complete Plan Button -->
              <div v-if="plan.status === '进行中' && areAllItemsCompleted(plan)" class="mt-4">
                <button @click="completePlan(plan.id)" class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm">
                  <i class="fas fa-check mr-1"></i> 完成计划
                </button>
              </div>
            </div>
          </div>
          <div class="ml-4 flex items-center space-x-2">
             <!-- 修改：确保使用 emit -->
            <button class="p-2 rounded-full" :class="plan.status === '未完成' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'" @click="plan.status !== '未完成' && emit('editPlan', plan.id)" :disabled="plan.status === '未完成'">
              <i class="fas fa-edit text-gray-600"></i>
            </button>
             <!-- 修改：确保使用 emit -->
            <button class="p-2 rounded-full" :class="plan.status === '未完成' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'" @click="plan.status !== '未完成' && emit('deletePlan', plan.id)" :disabled="plan.status === '未完成'">
              <i class="fas fa-trash text-gray-600"></i>
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, defineEmits } from 'vue'; // 引入 defineEmits
import { api } from '../../API_connect';

// 定义 emits
const emit = defineEmits(['editPlan', 'deletePlan']);

const plans = ref([] as any);
// 修改初始值为 '进行中'
const currentTab = ref('进行中');

// --- 确保本地没有定义 editPlan 和 deletePlan 函数 ---
// 如果之前有 const editPlan = () => { ... } 或 const deletePlan = () => { ... }，请删除它们

// 计算属性：根据当前标签过滤计划
const filteredPlans = computed(() => {
  return plans.value.filter((plan: { status: string }) => plan.status === currentTab.value);
});

// 获取计划内容 (保留这一个)
const fetchPlanContents = async (contentIds: number[]) => {
  try {
    const response = await api.post('/plan/send_plan_contents', null, {
      params: {
        plan_id: JSON.stringify(contentIds)
      },
      paramsSerializer: { indexes: null }
    });
    return response.data;
  } catch (error) {
    console.error('获取计划内容失败:', error);
    // 返回一个默认值或重新抛出错误，以便调用者可以处理
    // 例如: return { contents: [] }; 或 throw error;
    return undefined; // 或者根据你的错误处理逻辑返回
  }
};

// -- 删除重复的定义 --
// 注释掉或直接删除从这里开始的重复 fetchPlanContents 函数
/*
// 判断计划状态
// 获取计划内容
const fetchPlanContents = async (contentIds: number[]) => {
  try {
    const response = await api.post('/plan/send_plan_contents', null, {
      params: {
        plan_id: JSON.stringify(contentIds)
      },
      paramsSerializer: { indexes: null }
    });
    return response.data;
  } catch (error) {
    console.error('获取计划内容失败:', error);
  }
};
*/

// --- 状态判断逻辑 (基于日期) ---
const getStatusBasedOnDate = (plan: { date: string; }): '进行中' | '未完成' => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const planDateParts = plan.date.split('-').map(Number);
  const planDate = new Date(planDateParts[0], planDateParts[1] - 1, planDateParts[2]);
  return planDate < today ? '未完成' : '进行中';
};

// 获取并更新计划数据
const storagePlans = (plansToStore: any[]) => {
  const stringPlans = JSON.stringify(plansToStore);
  localStorage.setItem('plans', stringPlans);
};

// Helper function to check if all items in a plan are completed
const areAllItemsCompleted = (plan: { items: { completed: boolean }[] }): boolean => {
  // 确保 items 存在且是一个数组，并且数组不为空
  if (!plan || !Array.isArray(plan.items) || plan.items.length === 0) {
    return false; // 如果没有项目，不能算作“全部完成”
  }
  return plan.items.every(item => item.completed);
};


// --- 修改 fetchPlans 的状态设置逻辑 ---
// In script section - fetchPlans function
const fetchPlans = async (forceRefresh = false) => {
  try {
    // --- 从缓存加载 ---
    if (!forceRefresh && localStorage.getItem('plans')) {
      const cachedPlans = JSON.parse(localStorage.getItem('plans')!);
      plans.value = cachedPlans.map((plan: any) => {
        if (plan.status === '已完成') {
           if (!areAllItemsCompleted(plan)) {
             console.warn(`Plan ID ${plan.id}: Cache status '已完成' but items not all completed. Resetting status based on date.`);
             return { ...plan, status: getStatusBasedOnDate(plan) };
           }
           return plan;
        } else {
           return { ...plan, status: getStatusBasedOnDate(plan) };
        }
      });
      console.log('cached Plans:', plans.value);
    } else {
      // --- 从 API 获取 (应用新的状态判断优先级) ---
      if (forceRefresh) {
        localStorage.removeItem('plans');
      }
      const { data: planData } = await api.post('/plan/send_plan');
      const sortedPlans = planData.sort((a: { plan_id: number; }, b: { plan_id: number; }) => a.plan_id - b.plan_id);
      const fullPlans = await Promise.all(sortedPlans.map(async (plan: any) => {
        // 添加字段存在性检查
        console.log('完整计划对象:', plan);
        // {{ edit_1 }}
        // 修正字段名拼写错误并确保使用正确的字段
        const contentIds = JSON.parse(plan.paln_content_id || '[]'); // 使用 'paln_content_id'
        console.log('有效内容ID列表:', contentIds);

        // 添加空内容ID过滤
        if (contentIds.length === 0) {
            console.warn('Plan ID', plan.plan_id, '没有内容ID');
            return {
                id: plan.plan_id,
                title: plan.plan_name,
                date: plan.plan_time,
                status: '未完成',
                isImportant: false,
                items: []
            };
        }

        // fetchPlanContents 调用不变，但后续处理需要调整
        const contentsResponse = await fetchPlanContents(contentIds).catch(error => {
            console.error('获取计划内容失败:', error);
            // {{ edit_2 }}
            // 返回一个包含空 contents 数组的结构，以便后续处理
            return { contents: [] };
        });

        // {{ edit_3 }}
        // 根据新的响应结构修正数据访问路径
        // 注意：fetchPlanContents 返回的是 { plan_ids: [...], contents: [...] }
        const items = contentsResponse?.contents?.map((item: any) => ({
          content: item.text,
          completed: item.完成度 === 1,
          id: item.id // 确保使用了 content item 的 id
        })) || []; // 添加空数组回退

        console.log('处理后的items:', items);

        // 核心修改: 优先检查所有子项是否都已完成
        // 创建临时的 plan 对象用于 areAllItemsCompleted 判断
        const tempPlanForCheck = { items: items };
        let initialStatus; // <--- 使用 let 声明 initialStatus
        if (areAllItemsCompleted(tempPlanForCheck)) { // <--- 移除了占位符 {{ edit_1 }}
          // 如果所有项都已完成，直接设为 "已完成"
          initialStatus = '已完成';
        } else {
          // 否则，根据日期判断是 "进行中" 还是 "未完成"
          initialStatus = getStatusBasedOnDate({ date: plan.plan_time });
        }

        return {
          id: plan.plan_id,
          title: plan.plan_name,
          date: plan.plan_time,
          status: initialStatus, // 使用新的优先级逻辑确定的状态
          isImportant: false,
          items: items
        };
      }));
      plans.value = fullPlans;
      storagePlans(fullPlans); // 存储新获取的数据
      console.log('Fetched and Saved plans:', plans.value);
    }
    console.log('Current plans:', plans.value);
  } catch (error) {
    console.error('获取计划数据失败:', error);
    alert('数据加载失败，请稍后重试');
  }
};

// 组件挂载时初始化数据
onMounted(() => {
  fetchPlans();
  const scrollHandler = (event: WheelEvent) => {
    const mainElement = document.querySelector('main');
    if (mainElement) {
      mainElement.scrollBy({
        top: event.deltaY,
        behavior: 'smooth'
      });
    }
  };
  window.addEventListener('wheel', scrollHandler);
  onBeforeUnmount(() => {
    window.removeEventListener('wheel', scrollHandler);
  });
});

// Method to mark a plan as completed (triggered by button click)
const completePlan = async (planId: number) => {
  const planIndex = plans.value.findIndex((p: any) => p.id === planId);
  if (planIndex !== -1 && plans.value[planIndex].status === '进行中' && areAllItemsCompleted(plans.value[planIndex])) {
    try {
      // 准备要更新的任务项数据
      const updateData = plans.value[planIndex].items.map((item: any) => ({
        uuid: item.id,
        completed: item.completed
      }));

      // 发送PUT请求更新任务状态
      await api.put('/plan/update_plan_contents', updateData);

      // 更新本地状态
      plans.value[planIndex].status = '已完成';
      storagePlans(plans.value);
      console.log(`计划 ID ${planId} 已标记为完成`);
    } catch (error) {
      console.error('更新任务状态失败:', error);
      alert('更新任务状态失败，请稍后重试');
    }
  } else {
     // --- 这部分 else 逻辑是处理 completePlan 失败或条件不满足的情况 ---
     if (planIndex === -1) {
        console.error(`未找到 ID 为 ${planId} 的计划`);
     } else if (plans.value[planIndex].status !== '进行中') {
        console.warn(`计划 ID ${planId} 状态为 ${plans.value[planIndex].status}, 无法标记为完成。`);
     } else if (!areAllItemsCompleted(plans.value[planIndex])) {
        console.warn(`计划 ID ${planId} 尚有未完成项目, 无法标记为完成。`);
     }
     // 移除了嵌套的 toggleItem 定义
  }
}; // <--- completePlan 函数定义结束

// --- 修改 toggleItem 的状态更新逻辑 ---
// 将 toggleItem 函数移到 completePlan 外部
const upload_list = ref<any[]>([]);  // 新增：存储更改的任务状态

// 修改 toggleItem 函数
const toggleItem = (planId: number, itemIndex: number) => {
  const planIndex = plans.value.findIndex((p: any) => p.id === planId);
  if (planIndex !== -1) {
    const plan = plans.value[planIndex];
    const item = plan.items[itemIndex];

    // '未完成'状态不允许勾选
    if (plan.status === '未完成') {
      console.log(`Plan ID ${planId} is '未完成', item toggling disabled.`);
      return;
    }

    // 切换项目完成状态
    item.completed = !item.completed;

    // 添加到或更新upload_list
    const existingIndex = upload_list.value.findIndex(u => u.uuid === item.id);
    if (existingIndex !== -1) {
      upload_list.value[existingIndex].completed = item.completed;
    } else {
      upload_list.value.push({
        uuid: item.id,
        completed: item.completed
      });
    }

    // **核心修改**: 状态管理逻辑
    if (!plan.items[itemIndex].completed && plan.status === '已完成') {
      // 1. 如果计划当前是 '已完成' 状态，并且用户正在取消勾选某一项
      //    则计划状态需要回退到 '进行中' 或 '未完成' (根据日期)
      plan.status = getStatusBasedOnDate(plan);
      console.log(`Plan ID ${planId} reverted to status: ${plan.status} due to item uncheck.`);
    } else if (plan.items[itemIndex].completed && areAllItemsCompleted(plan) && plan.status !== '已完成') {
      // 2. 如果用户刚刚勾选了某一项，并且现在所有项都已完成，
      //    且计划当前状态不是 '已完成' (避免重复设置)，则将状态更新为 '已完成'
      plan.status = '已完成';
      console.log(`Plan ID ${planId} automatically set to '已完成' as all items are now completed.`);
    }
    // else: (保持不变)

    // 更新本地存储
    storagePlans(plans.value);

    console.log(`切换计划 ID ${planId}, 项目索引 ${itemIndex} 的状态。当前计划状态: ${plan.status}`);
  }
};

// 新增：更新任务的函数
const updatePlanContents = async () => {
  if (upload_list.value.length === 0) {
    alert('没有需要更新的任务');
    return;
  }

  try {
    await api.put('/plan/update_plan_contents', upload_list.value);
    alert('任务更新成功');
    fetchPlans(true); // 强制刷新数据
    upload_list.value = []; // 清空更新列表
  } catch (error) {
    console.error('更新任务失败:', error);
    alert('更新任务失败，请稍后重试');
  }
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
