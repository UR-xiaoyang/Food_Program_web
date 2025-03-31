<template>
  <div class="personal-info-container" v-if="是否已登录">
    <h1>个人信息</h1>
    <div class="personal-info">
      <div class="scroll-container">
        <form @submit.prevent="更新用户信息">
          <div class="info-section">
            <div class="info-item" v-for="(项, 索引) in 信息项" :key="索引">
              <label>{{ 项.标签 }}:</label>
              <input v-if="项.类型 === 'input'"
                     :type="项.标签.includes('年龄') || 项.标签.includes('体重') || 项.标签.includes('身高') ? 'number' : 'text'"
                     v-model="用户[项.模型]"
                     :min="项.最小值"
                     :max="项.最大值"
                     required
                     @input="验证输入(项)" />
              <select v-else-if="项.类型 === 'select'"
                      v-model="用户[项.模型]"
                      required>
                <option disabled value="">请选择</option> <!-- 添加一个默认的禁用选项 -->
                <option v-for="选项 in 项.选项" :key="选项" :value="选项">{{ 选项 }}</option>
              </select>
              <!-- 修改：处理自定义多选下拉菜单 -->
              <div v-else-if="项.类型 === 'multiselect'" class="custom-multiselect">
                <!-- 显示框 + 触发器 -->
                <input type="text"
                       :value="formatSelectedOptions(用户[项.模型])"
                       readonly
                       @click="toggleDropdown(项.模型)"
                       class="multiselect-display"
                       placeholder="点击选择偏好">
                <!-- 下拉复选框面板 -->
                <div v-show="dropdownVisible[项.模型]" class="multiselect-dropdown">
                  <div v-for="选项 in 项.选项" :key="选项" class="checkbox-item">
                    <input type="checkbox"
                           :id="`${项.模型}-${选项}`"
                           :value="选项"
                           v-model="用户[项.模型]">
                    <label :for="`${项.模型}-${选项}`">{{ 选项 }}</label>
                  </div>
                  <!-- 可选：添加关闭按钮 -->
                  <!-- <button type="button" @click="toggleDropdown(项.模型)">完成</button> -->
                </div>
              </div>
            </div>
          </div>
          <button type="submit">更新信息</button>
        </form>
      </div>
    </div>
  </div>
  <div v-else>
    <p>未登录，正在跳转到登录界面...</p>
  </div>
  <Modal :isVisible="showModal" @close="showModal = false">
    <p>用户信息已更新!</p>
  </Modal>
</template>

<script>
import { api } from "../../API_connect.ts"; // 假设这是封装好的 API 实例
import Modal from '../Modal.vue'; // 引入弹窗组件

export default {
  components: {
    Modal,
  },
  data() {
    return {
      是否已登录: false, // 是否已登录
      用户: {
        编号: null,
        用户编号: '',
        年龄: null,
        性别: '',
        体重: null,
        身高: null,
        健康状况: '', // 保持字符串，单选下拉菜单的值
        饮食偏好: [] // 改为空数组以适应多选 v-model
      },
      信息项: [
        {标签: '年龄', 类型: 'input', 模型: '年龄', 最小值: 0, 最大值: 120},
        {标签: '性别', 类型: 'select', 模型: '性别', 选项: ['男', '女']},
        {标签: '体重 (kg)', 类型: 'input', 模型: '体重', 最小值: 0, 最大值: 500},
        {标签: '身高 (cm)', 类型: 'input', 模型: '身高', 最小值: 0, 最大值: 300},
        {标签: '健康状况', 类型: 'select', 模型: '健康状况', 选项: ['良好', '一般', '需关注', '其他']}, // 修改为 select 类型，并添加选项
        {标签: '饮食偏好', 类型: 'multiselect', 模型: '饮食偏好', 选项: ['无特殊', '素食', '低糖', '低脂', '高蛋白', '清真']} // 修改为 multiselect 类型，并添加选项
      ],
      showModal: false, // 控制弹窗显示
      // 新增：控制自定义下拉菜单的显示状态，用模型名称作为键
      dropdownVisible: {
        饮食偏好: false
      }
    };
  },

  computed: {
    // {{ Removed computed property '食物选择字符串' }}
  },

  methods: {
    // 获取存储的 token
    获取Token() {
      return this.getCookie('token'); // 从 cookie 中获取 token
    },

    // 获取 cookie 中的值
    getCookie(名称) {
      const 名称EQ = 名称 + "=";
      const 所有Cookie = document.cookie.split(';');
      for (let i = 0; i < 所有Cookie.length; i++) {
        let 当前Cookie = 所有Cookie[i];
        while (当前Cookie.charAt(0) === ' ') 当前Cookie = 当前Cookie.substring(1, 当前Cookie.length);
        if (当前Cookie.indexOf(名称EQ) === 0) return 当前Cookie.substring(名称EQ.length, 当前Cookie.length);
      }
      console.log("没有cookie");
      return null;
    },

    // 获取用户信息
    async 获取用户信息() {
      try {
        const token = this.获取Token();
        const 响应 = await api.post('/user/data_find', {}, {
          headers: {
            Authorization: `Bearer ${token}` // 通过 Authorization 头部传递 token
          }
        });

        if (响应.status === 200) {
          const 用户信息 = 响应.data.detail; // 解析用户信息
          console.log('获取到的用户信息:', 用户信息);
          this.是否已登录 = true;
          this.用户 = {
            编号: 用户信息[0],
            用户编号: 用户信息[1],
            年龄: 用户信息[2],
            性别: 用户信息[3],
            体重: 用户信息[4],
            身高: 用户信息[5],
            健康状况: 用户信息[6],
            // 将从 API 获取的字符串（假设是逗号分隔）转换为数组
            饮食偏好: 用户信息[7] ? 用户信息[7].split(',').map(item => item.trim()) : []
          };
        }
      } catch (错误) {
        console.error('获取用户信息失败:', 错误);
        if (错误.response && 错误.response.status === 403) {
          this.跳转到登录页面(); // 如果返回 403，跳转到登录界面
        } else {
          // {{ Removed alert, handled below }}
          console.error('获取用户信息失败，请稍后重试。'); // 改为 console 输出，避免过多弹窗
        }
      }
    },

    // 验证输入
    验证输入(项) {
      const 值 = this.用户[项.模型];
      if (项.模型 === '年龄') {
        if (值 < 0 || 值 > 120) {
          alert('年龄必须在0到120之间');
          this.用户[项.模型] = null;
        }
      } else if (项.模型 === '体重') {
        if (值 < 0 || 值 > 500) {
          alert('体重必须在0到500之间');
          this.用户[项.模型] = null;
        }
      } else if (项.模型 === '身高') {
        if (值 < 0 || 值 > 300) {
          alert('身高必须在0到300之间');
          this.用户[项.模型] = null;
        }
      }
    },

    // 新增：切换下拉菜单的显示状态
    toggleDropdown(模型) {
      this.dropdownVisible[模型] = !this.dropdownVisible[模型];
      // 可选：点击其他地方关闭，需要更复杂的事件处理
    },

    // 新增：格式化选中的项目以供显示
    formatSelectedOptions(optionsArray) {
      if (!optionsArray || optionsArray.length === 0) {
        return '请选择偏好';
      }
      return optionsArray.join(', ');
    },

    // 更新用户信息
    async 更新用户信息() {
      try {
        const token = this.获取Token();
        const 请求体 = {
          ID: this.用户.编号,
          年龄: parseInt(this.用户.年龄),
          性别: this.用户.性别,
          体重: parseFloat(this.用户.体重),
          身高: parseFloat(this.用户.身高),
          健康状态: this.用户.健康状况,
          // 确保饮食偏好是数组才调用 join
          饮食偏好: Array.isArray(this.用户.饮食偏好) ? this.用户.饮食偏好.join(',') : ''
        };

        const 响应 = await api.post('/user/data_write', 请求体, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (响应.status === 200) {
          console.log('更新后的用户信息:', 响应.data);
          this.showModal = true;
          // 关闭可能打开的下拉菜单
          Object.keys(this.dropdownVisible).forEach(key => {
            this.dropdownVisible[key] = false;
          });
        }
      } catch (错误) {
        console.error('更新用户信息失败:', 错误);
        if (错误.response && 错误.response.status !== 200 && 错误.response.status !== 403) {
           alert('更新失败，请稍后重试。');
        } else if (!错误.response) {
           alert('更新失败，请检查网络连接或稍后重试。');
        }
      }
    },

    // 跳转到登录页面
    跳转到登录页面() {
      window.location.href = '/login'; // 假设登录页面路径为 /login
    },
  },

  mounted() {
    this.获取用户信息(); // 在组件挂载时检查登录状态
  }
};
</script>

<style scoped>
.personal-info-container {
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

h1 {
  text-align: center;
  margin-bottom: 20px;
}

.personal-info {
  max-height: 80vh; /* 设置最大高度 */
  overflow: auto; /* 启用滚动条 */
}

.scroll-container {
  overflow-y: auto; /* 启用垂直滚动条 */
  padding-right: 10px; /* 避免内容被滚动条遮挡 */
}

.info-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.info-item {
  background: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.1);
}

input, select, textarea {
  width: 100%;
  padding: 8px;
  margin-top: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box; /* 确保 padding 不会撑开元素宽度 */
}

/* 自定义多选下拉菜单样式 */
.custom-multiselect {
  position: relative; /* 为下拉面板的绝对定位提供基准 */
  margin-top: 5px;
}

.multiselect-display {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #fff; /* 背景设为白色，使其看起来像输入框 */
  cursor: pointer; /* 提示用户可以点击 */
  box-sizing: border-box;
  min-height: 36px; /* 保证一定高度 */
  line-height: 1.5; /* 调整行高 */
}

.multiselect-dropdown {
  position: absolute;
  top: 100%; /* 定位在显示框下方 */
  left: 0;
  width: 100%;
  max-height: 150px; /* 限制最大高度，超出则滚动 */
  overflow-y: auto;
  background-color: white;
  border: 1px solid #ccc;
  border-top: none; /* 避免双边框 */
  border-radius: 0 0 4px 4px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  z-index: 10; /* 确保在其他元素之上 */
  padding: 5px;
  box-sizing: border-box;
}

.checkbox-item {
  display: flex; /* 使用 flex 布局对齐 */
  align-items: center; /* 垂直居中对齐 */
  padding: 5px 8px;
  cursor: pointer; /* 提示可以点击整行 */
}

.checkbox-item:hover {
  background-color: #f0f0f0; /* 鼠标悬停效果 */
}

.checkbox-item input[type="checkbox"] {
  width: auto; /* 恢复 checkbox 的默认宽度 */
  margin-right: 8px; /* 复选框和标签之间的间距 */
  margin-top: 0; /* 移除继承的 margin-top */
  vertical-align: middle; /* 尝试垂直对齐 */
}

.checkbox-item label {
  margin: 0; /* 移除可能的默认 margin */
  flex-grow: 1; /* 让标签占据剩余空间 */
  line-height: 1.2; /* 调整标签行高 */
}

button {
  margin-top: 20px;
  padding: 10px 15px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button:hover {
  background-color: #45a049;
}
</style>