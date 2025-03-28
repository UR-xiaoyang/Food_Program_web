<template>
  <div class="nutrition-dashboard">
    <div class="three-column-layout">
      <!-- 左侧面板 - 健康评分和营养摄入比例 -->
      <div class="left-panel glow-effect">
        <div class="panel-section">
          <h3>健康评分</h3>
          <div class="gauge-container">
            <div class="score-display">
              <span class="score">87</span>
              <span class="score-label">优秀</span>
            </div>
            <canvas id="healthScoreGauge"></canvas>
          </div>
        </div>
        
        <div class="panel-section">
          <h3>营养摄入比例</h3>
          <div class="pie-chart-container">
            <canvas id="nutritionPieChart"></canvas>
          </div>
          <!-- {{ edit_1: 删除下面的手动图例 }} -->
          <!-- <div class="nutrition-legend">
            <div class="legend-item">
              <span class="legend-color" style="background-color: #00ff88"></span>
              <span class="legend-text">碳水化合物 60%</span>
            </div>
            <div class="legend-item">
              <span class="legend-color" style="background-color: #00c3ff"></span>
              <span class="legend-text">蛋白质 25%</span>
            </div>
            <div class="legend-item">
              <span class="legend-color" style="background-color: #ff5e62"></span>
              <span class="legend-text">脂肪 15%</span>
            </div>
          </div> -->
        </div>
      </div>
      
      <!-- 中间面板 - 计划完成情况折线图 -->
      <div class="center-panel glow-effect">
        <h3>计划完成趋势</h3>
        <div class="chart-container" style="height: 300px;">
          <canvas id="planCompletionChart"></canvas>
        </div>
        
        <div class="data-summary">
          <div class="summary-card">
            <div class="summary-value">24</div>
            <div class="summary-label">总计划数</div>
          </div>
          <div class="summary-card">
            <div class="summary-value">18</div>
            <div class="summary-label">已完成</div>
          </div>
          <div class="summary-card">
            <div class="summary-value">4</div>
            <div class="summary-label">进行中</div>
          </div>
          <div class="summary-card">
            <div class="summary-value">2</div>
            <div class="summary-label">未完成</div>
          </div>
        </div>
      </div>
      
      <!-- 右侧面板 - 营养素摄入和健康建议 -->
      <div class="right-panel glow-effect">
        <h3>营养素摄入</h3>
        <div class="nutrient-progress">
          <div class="nutrient-item">
            <div class="nutrient-info">
              <span class="nutrient-name">蛋白质</span>
              <span class="nutrient-value">85g / 90g</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: 94%"></div>
            </div>
          </div>
          
          <div class="nutrient-item">
            <div class="nutrient-info">
              <span class="nutrient-name">碳水化合物</span>
              <span class="nutrient-value">220g / 250g</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: 88%"></div>
            </div>
          </div>
          
          <div class="nutrient-item">
            <div class="nutrient-info">
              <span class="nutrient-name">脂肪</span>
              <span class="nutrient-value">45g / 60g</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: 75%"></div>
            </div>
          </div>
          
          <div class="nutrient-item">
            <div class="nutrient-info">
              <span class="nutrient-name">纤维素</span>
              <span class="nutrient-value">18g / 25g</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: 72%"></div>
            </div>
          </div>
          
          <div class="nutrient-item">
            <div class="nutrient-info">
              <span class="nutrient-name">维生素C</span>
              <span class="nutrient-value">85mg / 90mg</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: 94%"></div>
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
import { onMounted, onBeforeUnmount, ref } from 'vue';
import Chart from 'chart.js/auto';
// 自定义防抖函数实现
function debounce(func: Function, wait: number) {
  let timeout: NodeJS.Timeout | null = null;
  return function (...args: any[]) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(this, args);
    }, wait);
  };
}

// 存储图表实例的引用
const charts = ref<Chart[]>([]);
// 统一的 resize 处理函数
let debouncedResizeHandler: (() => void) | null = null;

const createCharts = () => {
  // 销毁现有图表实例以避免内存泄漏，如果需要重新创建的话
  // charts.value.forEach(chart => chart.destroy());
  // charts.value = [];
  // 注意：这里假设图表仅在 onMounted 时创建一次，resize 时只调整大小，不重新创建

  // 健康评分仪表盘
  const healthScoreCtx = document.getElementById('healthScoreGauge') as HTMLCanvasElement;
  if (healthScoreCtx && !charts.value.some(c => c.canvas === healthScoreCtx)) { // 避免重复创建
    const healthChart = new Chart(healthScoreCtx, {
      type: 'doughnut',
      data: {
        datasets: [{
          // {{ edit_1: 调整仪表盘颜色以适应米色背景 }}
          data: [87, 13],
          backgroundColor: ['#4CAF50', '#e0e0e0'], // 改为深绿 和 浅灰
          borderWidth: 0,
          circumference: 180,
          rotation: 270
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '80%',
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            enabled: false
          }
        }
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
          data: [60, 25, 15],
          // {{ edit_1: 调整饼图颜色为更深的色调 }}
          // 例如，使用更饱和或稍暗的颜色
          backgroundColor: ['#4CAF50', '#1E88E5', '#E53935'], // 深绿、深蓝、深红
          borderWidth: 1, // 可以添加一个细边框增加区分度
          borderColor: '#fff' // 白色边框
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'right',
            labels: {
              color: 'rgba(0, 0, 0, 1)', // 保持黑色图例文字
              boxWidth: 12,
              padding: 20
            }
          }
          // 可以考虑添加 tooltip 样式调整，如果需要的话
        }
      }
    });
    charts.value.push(nutritionChart);
  }

  // 计划完成情况折线图
  const planCompletionCtx = document.getElementById('planCompletionChart') as HTMLCanvasElement;
  if (planCompletionCtx && !charts.value.some(c => c.canvas === planCompletionCtx)) {
    const planChart = new Chart(planCompletionCtx, {
      type: 'line',
      data: {
        labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
        datasets: [{
          label: '完成率',
          data: [85, 90, 75, 95, 80, 88, 92],
          // {{ edit_2: 调整折线图颜色为更深的绿色调 }}
          borderColor: '#388E3C', // 更深的绿色线条
          backgroundColor: 'rgba(56, 142, 60, 0.3)', // 对应深绿色的半透明填充
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#388E3C', // 数据点颜色
          pointBorderColor: '#fff', // 数据点边框
          pointHoverBackgroundColor: '#fff', // 悬停时数据点背景
          pointHoverBorderColor: '#388E3C' // 悬停时数据点边框
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
          // 可以考虑添加 tooltip 样式调整
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              callback: (value) => `${value}%`,
              color: 'rgba(0, 0, 0, 1)' // 保持黑色 Y 轴刻度
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.1)' // 保持浅灰色网格线
            }
          },
          x: {
            ticks: {
              color: 'rgba(0, 0, 0, 1)' // 保持黑色 X 轴刻度
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.1)' // 保持浅灰色网格线
            }
          }
        }
      }
    });
    charts.value.push(planChart);
  }
};

// 定义统一的 resize 处理逻辑
const handleResize = () => {
  charts.value.forEach(chart => {
    chart.resize();
  });
};

onMounted(() => {
  createCharts();
  debouncedResizeHandler = debounce(handleResize, 300);
  window.addEventListener('resize', debouncedResizeHandler);
});

onBeforeUnmount(() => {
  charts.value.forEach(chart => chart.destroy());
  charts.value = [];
  if (debouncedResizeHandler) {
      window.removeEventListener('resize', debouncedResizeHandler);
  }
});

</script>

<style lang="scss" scoped>
// {{ edit_6: 导入基础样式，如果 nutrition.scss 包含背景相关的设置，可能需要调整 }}
@use '../../css/nutrition' as *;

// {{ edit_7: 设置整体背景和基础文字颜色 }}
.nutrition-dashboard {
  // {{ edit_1: 使用 !important 强制应用背景色 }}
  background-color: #d2b48c !important; // Tan / 棕褐色背景
  padding: 2rem; 
  color: #333; // 默认文字颜色保持深灰
}

// {{ edit_8: 调整三列布局和面板样式 }}
.three-column-layout {
  // ... 保持原有布局样式，如 display: grid ...
}

.left-panel,
.center-panel,
.right-panel {
  // {{ edit_2: 考虑将面板背景改为柔和的灰白色，以减少与深背景的对比度 }}
  background-color: #fdfbf6; // 非常浅的灰白色，比纯白柔和
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15); // 可以稍微加深阴影
  // animation: none; // 移除 glow-effect 动画
}

.dashboard-title {
  font-size: 2.5rem;
  // {{ edit_9: 调整标题颜色和阴影 }}
  color: #388E3C; // 深绿色
  text-align: center;
  margin-bottom: 2rem;
  // text-shadow: 0 0 15px rgba(0, 255, 136, 0.5); // 移除或更改文字阴影
  text-shadow: none;
  font-weight: 300;
  letter-spacing: 2px;
}

.panel-section h3 {
  color: #333; // 确保小标题是深色
  margin-bottom: 1rem;
  border-bottom: 1px solid #eee; // 添加分隔线
  padding-bottom: 0.5rem;
}

// {{ edit_1: 添加 position: relative 使绝对定位的子元素相对此容器定位 }}
.gauge-container {
  position: relative; // 确保 .score-display 相对于此容器定位
  // 可以根据需要设置一个最小高度或宽高比，以保证容器有尺寸
  min-height: 150px; // 示例：设置最小高度，避免容器坍塌
  display: flex; // 使用 flex 布局帮助管理 canvas 尺寸
  justify-content: center; // 水平居中 canvas (如果需要)
  align-items: center; // 垂直居中 canvas (如果需要)
}

.score-display {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  z-index: 10; // 确保文字在图表上方
}

.score {
  display: block;
  font-size: 3rem;
  font-weight: 700;
  color: #388E3C; // 深绿色
  line-height: 1;
}

.score-label {
  font-size: 1rem;
  color: #555; // 深灰色
}

/* 移除手动图例样式，因为已删除 HTML */
/* .nutrition-legend { ... } */
/* .legend-item { ... } */
/* .legend-color { ... } */
/* .legend-text { ... } */

.data-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); // 响应式列
  gap: 1rem;
  margin-top: 1.5rem; // 调整间距
}

.summary-card {
  // {{ edit_11: 调整汇总卡片样式 (继续) }}
  // {{ edit_3: 使用与面板一致的非常浅的灰色背景 }}
  background: #f9f9f9; // 保持或改为 #fdfbf6 的近似色
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
  border: 1px solid #ddd; // 边框颜色加深一点
}

.summary-value {
  font-size: 2rem;
  font-weight: 700;
  // {{ edit_12: 调整汇总数值颜色 }}
  color: #388E3C; // 深绿色
  margin-bottom: 0.5rem;
}

.summary-label {
  font-size: 0.8rem;
  // {{ edit_13: 调整汇总标签颜色 }}
  color: #666; // 稍深的灰色
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

.nutrient-name {
  // {{ edit_14: 调整营养素名称颜色 }}
  color: #555; // 深灰色
}

.nutrient-value {
  // {{ edit_15: 调整营养素数值颜色 }}
  color: #388E3C; // 深绿色
}

.progress-bar {
  height: 8px;
  // {{ edit_16: 调整进度条背景色 }}
  background: #e0e0e0; // 浅灰色背景
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  // {{ edit_17: 调整进度条填充色 }}
  background: linear-gradient(90deg, #66BB6A, #43A047); // 绿色渐变
  border-radius: 4px;
}

.health-tips {
  // {{ edit_18: 调整健康建议区域样式 }}
  // {{ edit_4: 使用与面板一致的背景色 }}
  background: #fdfbf6; // 与面板背景协调
  border-radius: 8px;
  padding: 1rem;
  border: 1px solid #ddd; // 边框颜色加深一点
}

.tip-item {
  display: flex;
  align-items: start; // 图标和文字顶部对齐可能更好
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  // {{ edit_19: 调整分隔线颜色 }}
  border-bottom: 1px solid #eee; // 更浅的灰色分隔线

  &:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
  }
}

.tip-icon {
  font-size: 1.5rem;
  margin-right: 1rem;
  color: #FBC02D; // 例如，使用黄色图标
  line-height: 1.5; // 确保与文本行高一致
}

.tip-content {
  // {{ edit_20: 调整建议内容颜色 }}
  color: #555; // 深灰色
  font-size: 0.9rem;
  line-height: 1.5;
}

// {{ edit_21: 移除或注释掉辉光动画，因为它在浅色背景下可能不合适 }}
/* @keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.4); // 使用绿色调的辉光
  }
  70% {
    box-shadow: 0 0 0 10px rgba(76, 175, 80, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0);
  }
} */

/* .glow-effect {
  animation: pulse 2s infinite;
} */

// {{ edit_22: (可选) 移除面板上的 glow-effect 类应用，如果你注释掉了动画 }}
// 在 <template> 部分的 .left-panel, .center-panel, .right-panel 上移除 glow-effect 类
/*
      <div class="left-panel"> // 移除 glow-effect
        ...
      </div>
      <div class="center-panel"> // 移除 glow-effect
        ...
      </div>
      <div class="right-panel"> // 移除 glow-effect
        ...
      </div>
*/


</style>