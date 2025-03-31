<template>
  <div class="nutrition-dashboard">
    <div class="three-column-layout">
      <!-- 左侧面板 - 健康评分和营养摄入比例 -->
      <div class="left-panel">
        <div class="panel-section">
          <h3>健康评分</h3>
          <div class="gauge-container">
            <div class="score-display">
              <span class="score">{{ Math.round(healthScore) }}</span>
              <span class="score-label">{{ scoreLabel }}</span>
            </div>
            <canvas id="healthScoreGauge"></canvas>
          </div>
        </div>
        
        <div class="panel-section">
          <h3>营养摄入比例</h3>
          <div class="pie-chart-container">
            <canvas id="nutritionPieChart"></canvas>
          </div>
        </div>
      </div>
      
      <!-- 中间面板 - 计划完成情况折线图 -->
      <div class="center-panel">
        <h3>计划完成趋势</h3>
        <div class="chart-container" style="height: 300px;">
          <canvas id="planCompletionChart"></canvas>
        </div>
        
        <div class="data-summary">
          <div class="summary-card">
            <div class="summary-value">{{ planStats.total }}</div>
            <div class="summary-label">总计划数</div>
          </div>
          <div class="summary-card">
            <div class="summary-value">{{ planStats.completed }}</div>
            <div class="summary-label">已完成</div>
          </div>
          <div class="summary-card">
            <div class="summary-value">{{ planStats.inProgress }}</div>
            <div class="summary-label">进行中</div>
          </div>
          <div class="summary-card">
            <div class="summary-value">{{ planStats.overdue }}</div>
            <div class="summary-label">未完成</div>
          </div>
        </div>
      </div>
      
      <!-- 右侧面板 - 营养素摄入和健康建议 -->
      <div class="right-panel">
        <h3>营养素摄入</h3>
        <div v-if="isLoading" class="loading-placeholder">正在加载营养数据...</div>
        <div v-else-if="error" class="error-message">加载失败: {{ error }}</div>
        <div v-else class="nutrient-progress">
          <div class="nutrient-item">
            <div class="nutrient-info">
              <span class="nutrient-name">蛋白质</span>
              <span class="nutrient-value">{{ nutritionData.protein.current }}g / {{ nutritionData.protein.target }}g</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: calculatePercentage(nutritionData.protein.current, nutritionData.protein.target) + '%' }"></div>
            </div>
          </div>
          <div class="nutrient-item">
            <div class="nutrient-info">
              <span class="nutrient-name">碳水化合物</span>
              <span class="nutrient-value">{{ nutritionData.carbohydrates.current }}g / {{ nutritionData.carbohydrates.target }}g</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: calculatePercentage(nutritionData.carbohydrates.current, nutritionData.carbohydrates.target) + '%' }"></div>
            </div>
          </div>
          <div class="nutrient-item">
            <div class="nutrient-info">
              <span class="nutrient-name">脂肪</span>
              <span class="nutrient-value">{{ nutritionData.fat.current }}g / {{ nutritionData.fat.target }}g</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: calculatePercentage(nutritionData.fat.current, nutritionData.fat.target) + '%' }"></div>
            </div>
          </div>
          <div class="nutrient-item">
            <div class="nutrient-info">
              <span class="nutrient-name">纤维素</span>
              <span class="nutrient-value">{{ nutritionData.fiber.current }}g / {{ nutritionData.fiber.target }}g</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: calculatePercentage(nutritionData.fiber.current, nutritionData.fiber.target) + '%' }"></div>
            </div>
          </div>
          <div class="nutrient-item">
            <div class="nutrient-info">
              <span class="nutrient-name">维生素C</span>
              <span class="nutrient-value">{{ nutritionData.vitamin_c.current }}mg / {{ nutritionData.vitamin_c.target }}mg</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: calculatePercentage(nutritionData.vitamin_c.current, nutritionData.vitamin_c.target) + '%' }"></div>
            </div>
          </div>
        </div>

        <h3>健康建议</h3>
        <div class="health-tips">
          <div class="tip-item">
            <div class="tip-icon">💡</div>
            <div class="tip-content">增加蔬菜水果摄入，提高纤维素含量</div>
          </div>
          <div class="tip-item">
            <div class="tip-icon">💧</div>
            <div class="tip-content">每日饮水量不足，建议增加至2000ml</div>
          </div>
          <div class="tip-item">
            <div class="tip-icon">🏃</div>
            <div class="tip-content">本周运动量达标，继续保持</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, computed, watch } from 'vue';
import Chart from 'chart.js/auto';
import { api } from '../../API_connect';

// 营养素数据
const nutritionData = ref({
  protein: { current: 0, target: 90 },
  carbohydrates: { current: 0, target: 250 },
  fat: { current: 0, target: 60 },
  fiber: { current: 0, target: 25 },
  vitamin_c: { current: 0, target: 90 }
});
const isLoading = ref(true);
const error = ref<string | null>(null);

// 计划数据
interface PlanItem {
  date: string;
  items: any[];
  status: string;
  id: number;
  title: string;
  content: string;
}
const planData = ref<PlanItem[]>([]);
const isLoadingPlans = ref(true);

// 图表实例
const charts = ref<Chart<any, any, any>[]>([]);
let debouncedResizeHandler: (() => void) | null = null;

// 获取营养数据
const fetchNutritionData = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const response = await api.post('/plan/send_nutrition_data');
    if (response.data && response.data.status === 'success') {
      const data = response.data.data;
      nutritionData.value.protein.current = data.protein || 0;
      nutritionData.value.carbohydrates.current = data.carbohydrates || 0;
      nutritionData.value.fat.current = data.fat || 0;
      nutritionData.value.fiber.current = data.fiber || 0;
      nutritionData.value.vitamin_c.current = data.vitamin_c || 0;
    } else {
      throw new Error('获取营养数据失败: 状态未成功');
    }
  } catch (err: any) {
    console.error('获取营养数据时出错:', err);
    error.value = err.message || '加载营养数据时发生未知错误';
  } finally {
    isLoading.value = false;
  }
};

// 获取计划数据
const fetchPlanData = async () => {
  try {
    const { data } = await api.post('/plan/send_plan');
    planData.value = data;
    if (localStorage.getItem('plans')) {
      const cachedPlans = JSON.parse(localStorage.getItem('plans')!);
      // Removed unused 'acc' variable declaration here
      planData.value = cachedPlans.map((plan: any) => ({
        ...plan,
        status: plan.status || getStatusBasedOnDate(plan)
      }));
    }
  } catch (err) {
    console.error('获取计划数据失败:', err);
  } finally {
    isLoadingPlans.value = false;
  }
};

// 计算计划状态统计
const planStats = computed(() => {
  return {
    total: planData.value.length,
    completed: planData.value.filter(p => p.status === '已完成').length,
    inProgress: planData.value.filter(p => p.status === '进行中').length,
    overdue: planData.value.filter(p => p.status === '未完成').length
  };
});

// 计算最近 7 天（包括今天）的每日完成率
const dailyCompletionRates = computed(() => {
  const today = new Date();
  const pastDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });

  const plansByDate = planData.value.reduce((acc: Record<string, PlanItem[]>, plan: PlanItem) => {
    const dateKey = plan.date.split('T')[0];
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(plan);
    return acc;
  }, {});

  // Removed unused local debounce function definition that was here

  return pastDates.map(date => {
    const plans = plansByDate[date] || [];
    if (plans.length === 0) return 0;
    const totalItems = plans.reduce((sum, p) => sum + p.items.length, 0);
    const completedItems = plans.reduce((sum, p) => sum + p.items.filter((i: any) => i.completed).length, 0);
    return totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
  });
});

// 计算营养评分
const nutritionScore = computed(() => {
  const nutrients = ['protein', 'carbohydrates', 'fat', 'fiber', 'vitamin_c'];
  const scores = nutrients.map(nutrient => {
    const nutrientKey = nutrient as keyof typeof nutritionData.value;
const { current, target } = nutritionData.value[nutrientKey];
    return Math.min(current / target, 1) * 100;
  });
  return scores.reduce((sum, score) => sum + score, 0) / scores.length;
});

// 计算计划完成评分
const planCompletionScore = computed(() => {
  const rates = dailyCompletionRates.value;
  if (rates.length === 0) return 0;
  return rates.reduce((sum, rate) => sum + rate, 0) / rates.length;
});

// 计算健康评分
const healthScore = computed(() => {
  return (nutritionScore.value + planCompletionScore.value) / 2;
});

// 健康评分标签
const scoreLabel = computed(() => {
  const score = healthScore.value;
  if (score >= 90) return '优秀';
  else if (score >= 80) return '良好';
  else if (score >= 70) return '一般';
  else return '待改进';
});

// 创建图表
const createCharts = () => {
  // 健康评分图
  const healthScoreCtx = document.getElementById('healthScoreGauge') as HTMLCanvasElement;
  if (healthScoreCtx && !charts.value.some(c => c.canvas === healthScoreCtx)) {
    const healthChart = new Chart(healthScoreCtx, {
      type: 'doughnut',
      data: {
        labels: ['健康评分', '剩余'],
        datasets: [{
          data: [healthScore.value, 100 - healthScore.value],
          backgroundColor: ['#388E3C', '#e0e0e0'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '80%',
        plugins: { legend: { display: false }, tooltip: { enabled: false } }
      }
    });
    charts.value.push(healthChart);
  }

  // 营养摄入比例饼图
  const nutritionPieCtx = document.getElementById('nutritionPieChart') as HTMLCanvasElement;
  if (nutritionPieCtx && !charts.value.some(c => c.canvas === nutritionPieCtx)) {
    const nutritionChart = new Chart(nutritionPieCtx, {
      type: 'pie',
      data: {
        labels: ['碳水化合物', '蛋白质', '脂肪'],
        datasets: [{
          data: [60, 25, 15], // 示例数据，可动态替换
          backgroundColor: ['#00ff88', '#00c3ff', '#ff5e62'],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { 
          legend: { 
            position: 'right', // 将图例位置从 'bottom' 改为 'right'
            labels: { color: '#333' } 
          } 
        }
      }
    });
    charts.value.push(nutritionChart);
  }

  // 计划完成趋势折线图
  const planCompletionCtx = document.getElementById('planCompletionChart') as HTMLCanvasElement;
  if (planCompletionCtx && !charts.value.some(c => c.canvas === planCompletionCtx)) {
    const planChart = new Chart(planCompletionCtx, {
      type: 'line',
      data: {
        labels: ['6天前', '5天前', '4天前', '3天前', '2天前', '1天前', '今天'],
        datasets: [{
          label: '完成率',
          data: dailyCompletionRates.value,
          borderColor: '#4CAF50',
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: { callback: (value) => `${value}%`, color: 'rgba(0, 0, 0, 1)' },
            grid: { color: 'rgba(0, 0, 0, 0.1)' }
          },
          x: {
            ticks: { color: 'rgba(0, 0, 0, 1)' },
            grid: { color: 'rgba(0, 0, 0, 0.1)' }
          }
        }
      }
    });
    charts.value.push(planChart);
  }
};

// 动态更新健康评分图表
watch(healthScore, (newScore) => {
  const healthChart = charts.value.find(chart => chart.canvas.id === 'healthScoreGauge');
  if (healthChart) {
    healthChart.data.datasets[0].data = [newScore, 100 - newScore];
    healthChart.update();
  }
});

// 窗口调整大小处理
const handleResize = () => {
  charts.value.forEach(chart => chart.resize());
};

// 防抖函数
function debounce(func: (...args: any[]) => void, wait: number) {
  let timeout: NodeJS.Timeout | null = null;
  // Added 'this: any' to fix implicit any error
  return function (this: any, ...args: any[]) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      return func.apply(this, args);
    }, wait) as unknown as NodeJS.Timeout;
  };
}

onMounted(async () => {
  await fetchNutritionData();
  await fetchPlanData();
  createCharts();
  debouncedResizeHandler = debounce(handleResize, 300);
  window.addEventListener('resize', debouncedResizeHandler);
});

onBeforeUnmount(() => {
  charts.value.forEach(chart => chart.destroy());
  charts.value = [];
  if (debouncedResizeHandler) window.removeEventListener('resize', debouncedResizeHandler);
});

// 计算进度条百分比
const calculatePercentage = (current: number, target: number) => {
  if (target <= 0) return 0;
  return Math.min(100, Math.round((current / target) * 100));
};

// 删除未使用的变量和函数
const getStatusBasedOnDate = (plan: any) => {
  const today = new Date().toISOString().split('T')[0];
  return plan.date < today ? '未完成' : '进行中';
};

// Removed unused code block starting from here:
// No longer present:
// const plansByDate = (plans as Plan[]).reduce((acc: Record<string, Plan[]>, plan: Plan) => {
//   const dateKey = plan.date.split('T')[0];
//   if (!acc[dateKey]) acc[dateKey] = [];
//   acc[dateKey].push(plan);
//   return acc;
// }, {});
// --- Removed the following lines which caused the error ---
// }, {});

// const processDate = (date: string) => {
//   const plans = plansByDate[date] || [];
//   const totalItems = plans.reduce((sum: number, p: any) => sum + p.items.length, 0);
//   const completedItems = plans.reduce((sum: number, p: any) => sum + p.items.filter((i: any) => i.completed).length, 0);
//   return totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
// };
// const debouncedAnalyze = debounce(() => {
//   if (analyzeText.value) {
//     analyzeNutrition(analyzeText.value);
//   }
// }, 500);
// --- End of removed section ---

</script>

<style lang="scss" scoped>
.nutrition-dashboard {
  background-color: #d2b48c !important;
  padding: 2rem;
  color: #333;
}

.three-column-layout {
  display: grid;
  grid-template-columns: 1fr 1.5fr 1fr;
  gap: 2rem;
}

.left-panel, .center-panel, .right-panel {
  background-color: #fdfbf6;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
}

.panel-section h3 {
  color: #333;
  margin-bottom: 1rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.5rem;
}

.gauge-container {
  position: relative;
  min-height: 150px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.score-display {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  z-index: 10;
}

.score {
  display: block;
  font-size: 3rem;
  font-weight: 700;
  color: #388E3C;
}

.score-label {
  font-size: 1rem;
  color: #555;
}

.data-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
}

.summary-card {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
  border: 1px solid #ddd;
}

.summary-value {
  font-size: 2rem;
  font-weight: 700;
  color: #388E3C;
  margin-bottom: 0.5rem;
}

.summary-label {
  font-size: 0.8rem;
  color: #666;
}

.nutrient-progress {
  margin-bottom: 2rem;
}

.nutrient-item {
  margin-bottom: 1rem;
}

.nutrient-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.3rem;
}

.nutrient-name { color: #555; }
.nutrient-value { color: #388E3C; }

.progress-bar {
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #66BB6A, #43A047);
  border-radius: 4px;
}

.health-tips {
  background: #fdfbf6;
  border-radius: 8px;
  padding: 1rem;
  border: 1px solid #ddd;
}

.tip-item {
  display: flex;
  align-items: start;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.tip-item:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.tip-icon {
  font-size: 1.5rem;
  margin-right: 1rem;
  color: #FBC02D;
  line-height: 1.5;
}

.tip-content {
  color: #555;
  font-size: 0.9rem;
  line-height: 1.5;
}
</style>
