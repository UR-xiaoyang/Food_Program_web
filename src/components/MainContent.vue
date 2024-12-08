<template>
  <main>
    <!-- 各个 section -->
    <section :class="['section', 'home', { active: currentSection === 'home' }]">
      <h1>计划美食，健康生活</h1>
      <a href="#plan" class="cta-button">开始计划</a>
    </section>
    <section :class="['section', 'news', { active: currentSection === 'news' }]">
      <div class="news-content">
        <img src="../assets/2e2eb9389b504fc2f068d060d078311f91ef6dd7.webp" alt="美食新闻" />
        <div class="news-text">
          <h2>中国菜如何漂洋过海俘获外国胃？</h2>
          <p>2024年，中餐出海步伐进一步加快。茶饮火爆东南亚地区，</p>
          <p>火锅、传统正餐等品牌进军欧美市场，几乎各个赛道上的头部品牌都在竭力抢占海外市场。</p>
          <p>但整体来说，中餐出海仍道阻且长。</p>
          <a href="#article" class="read-more-button">开始阅读</a>
        </div>
      </div>
    </section>
    <section :class="['section', 'recipes', { active: currentSection === 'recipes' }]">
      <h2>示例计划单</h2>
      <div class="paper-list">
        <div class="day-card">
          <h3>星期一</h3>
          <ul>
            <li>
              <input type="checkbox" id="monday-breakfast" @change="toggleCompleted('monday-breakfast')">
              <label :for="'monday-breakfast'" :class="{ 'completed': completed['monday-breakfast'] }">
                <strong>早餐:</strong> 燕麦粥 + 香蕉 + 煮鸡蛋
              </label>
            </li>
            <li>
              <input type="checkbox" id="monday-lunch" @change="toggleCompleted('monday-lunch')">
              <label :for="'monday-lunch'" :class="{ 'completed': completed['monday-lunch'] }">
                <strong>午餐:</strong> 烤鸡胸肉沙拉 + 橙子
              </label>
            </li>
            <li>
              <input type="checkbox" id="monday-dinner" @change="toggleCompleted('monday-dinner')">
              <label :for="'monday-dinner'" :class="{ 'completed': completed['monday-dinner'] }">
                <strong>晚餐:</strong> 清蒸三文鱼 + 西兰花 + 糙米饭
              </label>
            </li>
            <li>
              <input type="checkbox" id="monday-snack" @change="toggleCompleted('monday-snack')">
              <label :for="'monday-snack'" :class="{ 'completed': completed['monday-snack'] }">
                <strong>加餐:</strong> 希腊酸奶 + 蓝莓
              </label>
            </li>
          </ul>
        </div>
      </div>
      <a href="#plan" class="cta-button">开始计划</a>
    </section>
    <section :class="['section', 'nutrition', { active: currentSection === 'nutrition' }]">
      <h2>营养分析</h2>
      <div class="dashboard">
        <div class="charts-container">
          <canvas id="nutritionChart"></canvas>
          <canvas id="lineChart"></canvas>
        </div>
        <div class="button-container">
          <a href="#detailed-analysis" class="cta-button">查看详细分析</a>
        </div>
      </div>
    </section>
    <section :class="['section', 'profile', { active: currentSection === 'profile' }]">
      <h2>版权信息</h2>
      <p>© 2024 食程计划 | IP属地：XXXX | 电话：123-456-7890</p>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import Chart from 'chart.js/auto';

const currentSection = ref('home');
const sections = ['home', 'news', 'recipes', 'nutrition', 'profile'];
const isLocked = ref(false);
const completed = ref({
  'monday-breakfast': false,
  'monday-lunch': false,
  'monday-dinner': false,
  'monday-snack': false,
});

const showSection = (section: string) => {
  console.log('切换到部分:', section); // 添加调试日志
  currentSection.value = section;

  // 滚动到对应的部分
  const sectionElement = document.querySelector(`section.${section}`);
  if (sectionElement) {
    sectionElement.scrollIntoView({ behavior: 'smooth' });
  }
};

const handleScroll = (event: WheelEvent) => {
  console.log('滚轮事件触发:', event.deltaY); // 添加调试日志
  if (isLocked.value) {
    event.preventDefault();
    return;
  }

  const delta = event.deltaY;
  const currentIndex = sections.indexOf(currentSection.value);

  if (delta > 0 && currentIndex < sections.length - 1) {
    showSection(sections[currentIndex + 1]);
  } else if (delta < 0 && currentIndex > 0) {
    showSection(sections[currentIndex - 1]);
  }

  isLocked.value = true;
  setTimeout(() => {
    isLocked.value = false;
  }, 800);
};

const toggleCompleted = (meal: string) => {
  completed.value[meal] = !completed.value[meal];
};

onMounted(() => {
  window.addEventListener('wheel', handleScroll, { passive: false });

  // 初始化营养分析饼图
  const ctxDoughnut = (document.getElementById('nutritionChart') as HTMLCanvasElement)?.getContext('2d');
  if (ctxDoughnut) {
    new Chart(ctxDoughnut, {
      type: 'doughnut',
      data: {
        labels: ['碳水化合物', '蛋白质', '脂肪'],
        datasets: [{
          label: '营养摄入比例',
          data: [60, 25, 15],
          backgroundColor: ['#f39c12', '#3498db', '#e74c3c'],
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' },
          tooltip: {
            callbacks: {
              label: (tooltipItem) => `${tooltipItem.label}: ${tooltipItem.raw}%`,
            }
          }
        }
      }
    });
  }

  // 初始化营养分析折线图
  const ctxLine = (document.getElementById('lineChart') as HTMLCanvasElement)?.getContext('2d');
  if (ctxLine) {
    new Chart(ctxLine, {
      type: 'line',
      data: {
        labels: ['周一', '周二', '周三', '周四', '周五'],
        datasets: [
          {
            label: '碳水化合物 (g)',
            data: [120, 130, 140, 150, 160],
            borderColor: '#f39c12',
            fill: false,
          },
          {
            label: '蛋白质 (g)',
            data: [60, 70, 75, 80, 85],
            borderColor: '#3498db',
            fill: false,
          },
          {
            label: '脂肪 (g)',
            data: [30, 25, 28, 24, 20],
            borderColor: '#e74c3c',
            fill: false,
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' },
          tooltip: {
            callbacks: {
              label: (tooltipItem) => `${tooltipItem.dataset.label}: ${tooltipItem.raw}g`,
            }
          }
        }
      }
    });
  }
});

onBeforeUnmount(() => {
  window.removeEventListener('wheel', handleScroll);
});
</script>

<style scoped lang="scss">
main {
  position: relative;
  height: 100vh;
  overflow: hidden;
}

.section {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  opacity: 0;
  transition: opacity 0.5s ease-in-out;
}

.section.active {
  opacity: 1;
  z-index: 1;
}

/* 你可以根据需要进一步调整样式 */
</style>
