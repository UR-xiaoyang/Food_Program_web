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
            <!-- 修改 @click 事件，传递 true 参数 -->
            <button @click="fetchPlans(true)" class="px-4 py-2 bg-green-500 text-white rounded">刷新</button> {{ edit_1 }}
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
            <button class="p-2 rounded-full" :class="plan.status === '未完成' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'" @click="plan.status !== '未完成' && editPlan(plan.id)">
              <i class="fas fa-edit text-gray-600"></i>
            </button>
            <button class="p-2 rounded-full" :class="plan.status === '未完成' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'" @click="plan.status !== '未完成' && deletePlan(plan.id)">
              <i class="fas fa-trash text-gray-600"></i>
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import { api } from '../../API_connect';

const plans = ref([] as any);
// 修改初始值为 '进行中'
const currentTab = ref('进行中');

// 计算属性：根据当前标签过滤计划
const filteredPlans = computed(() => {
  return plans.value.filter((plan: { status: string }) => plan.status === currentTab.value);
});

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

// In script section

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
        const contentIds = JSON.parse(plan.paln_content_id || '[]');
        const contents = await fetchPlanContents(contentIds);
        const items = contents?.contents?.map((item: { text: string; 完成度: number; }) => ({ content: item.text, completed: item.完成度 === 1 })) || [];

        // **核心修改**: 优先检查所有子项是否都已完成 (完成度为1)，如果是，则状态直接设为“已完成”，不再考虑日期；否则，再根据日期判断是“进行中”还是“未完成”。
        let initialStatus: '进行中' | '未完成' | '已完成';
        // 创建临时的 plan 对象用于 areAllItemsCompleted 判断
        const tempPlanForCheck = { items: items };
        if (areAllItemsCompleted(tempPlanForCheck)) { // {{ edit_1 }} 已移除此处的占位符
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
const completePlan = (planId: number) => {
  const planIndex = plans.value.findIndex((p: any) => p.id === planId);
  if (planIndex !== -1 && plans.value[planIndex].status === '进行中' && areAllItemsCompleted(plans.value[planIndex])) {
    // 确认是进行中且所有项完成才设置为已完成
    plans.value[planIndex].status = '已完成';
    storagePlans(plans.value);
    console.log(`计划 ID ${planId} 已标记为完成`);
  } else {
     if (planIndex === -1) {
        console.error(`未找到 ID 为 ${planId} 的计划`);
     } else {
        console.warn(`Plan ID ${planId} completion condition not met. Status: ${plans.value[planIndex].status}, All items completed: ${areAllItemsCompleted(plans.value[planIndex])}`);
     }
  }
};


// --- 修改 toggleItem 的状态更新逻辑 ---
const toggleItem = (planId: number, itemIndex: number) => {
  const planIndex = plans.value.findIndex((p: any) => p.id === planId);
  if (planIndex !== -1) {
    const plan = plans.value[planIndex];

     // '未完成' 或 '已完成' 状态下不允许直接通过 toggle 操作 (虽然 input disabled 了，双重保险)
     // 注意：这里的条件已在 input 的 :disabled 中处理，但保留逻辑以防万一
     // if (plan.status === '未完成' || plan.status === '已完成') {
     //    console.log(`Plan ID ${planId} is '${plan.status}', item toggling disabled.`);
     //    return;
     // }
     // 修正：允许在"已完成"状态下取消勾选

     // '未完成'状态不允许勾选
     if (plan.status === '未完成') {
        console.log(`Plan ID ${planId} is '未完成', item toggling disabled.`);
        return;
     }


    // 切换项目完成状态
    plan.items[itemIndex].completed = !plan.items[itemIndex].completed;

    // **核心修改**: 状态管理逻辑
    if (!plan.items[itemIndex].completed && plan.status === '已完成') { {{ edit_3 }}
      // 1. 如果计划当前是 '已完成' 状态，并且用户正在取消勾选某一项
      //    则计划状态需要回退到 '进行中' 或 '未完成' (根据日期)
      plan.status = getStatusBasedOnDate(plan);
      console.log(`Plan ID ${planId} reverted to status: ${plan.status} due to item uncheck.`);
    } else if (plan.items[itemIndex].completed && areAllItemsCompleted(plan) && plan.status !== '已完成') { {{ edit_4 }}
      // 2. 如果用户刚刚勾选了某一项，并且现在所有项都已完成，
      //    且计划当前状态不是 '已完成' (避免重复设置)，则将状态更新为 '已完成'
      plan.status = '已完成';
      console.log(`Plan ID ${planId} automatically set to '已完成' as all items are now completed.`);
    }
    // else:
    // 3. 如果正在勾选但未完成所有项，状态保持 '进行中' 不变。
    // 4. 如果在 '已完成' 状态下勾选（理论上不应发生，因为checkbox禁用），状态保持 '已完成'。

    // 更新本地存储
    storagePlans(plans.value);

    console.log(`切换计划 ID ${planId}, 项目索引 ${itemIndex} 的状态。当前计划状态: ${plan.status}`);
  }
};

// --- editPlan 和 deletePlan 保持不变 ---
const editPlan = (planId: number) => {
  // ... existing logic ...
};
const deletePlan = (planId: number) => {
  // ... existing logic ...
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
