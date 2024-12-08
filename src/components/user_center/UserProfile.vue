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
                     type="text"
                     v-model="用户[项.模型]"
                     :min="项.最小值"
                     required
                     @input="验证输入(项)" />
              <select v-else-if="项.类型 === 'select'"
                      v-model="用户[项.模型]"
                      required>
                <option v-for="选项 in 项.选项" :key="选项" :value="选项">{{ 选项 }}</option>
              </select>
              <textarea v-else-if="项.类型 === 'textarea'"
                        v-model="食物选择字符串"
                        @input="更新食物选择"
                        required></textarea>
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
        健康状况: '',
        饮食偏好: ''
      },
      信息项: [
        {标签: '年龄', 类型: 'input', 模型: '年龄', 最小值: 0, 最大值: 120},
        {标签: '性别', 类型: 'select', 模型: '性别', 选项: ['男', '女']},
        {标签: '体重 (kg)', 类型: 'input', 模型: '体重', 最小值: 0, 最大值: 500},
        {标签: '身高 (cm)', 类型: 'input', 模型: '身高', 最小值: 0, 最大值: 300},
        {标签: '健康状况', 类型: 'input', 模型: '健康状况'},
        {标签: '饮食偏好', 类型: 'input', 模型: '饮食偏好'}
      ],
      showModal: false, // 控制弹窗显示
    };
  },

  computed: {
    食物选择字符串: {
      get() {
        return this.用户.食物选择?.join(', ') || '';
      },
      set(新值) {
        this.用户.食物选择 = 新值.split(',').map(项 => 项.trim());
      },
    },
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
            饮食偏好: 用户信息[7]
          };
        }
      } catch (错误) {
        console.error('获取用户信息失败:', 错误);
        if (错误.response && 错误.response.status === 403) {
          this.跳转到登录页面(); // 如果返回 403，跳转到登录界面
        } else {
          alert('获取用户信息失败，请稍后重试。');
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

    // 更新用户信息
    async 更新用户信息() {
      try {
        const token = this.获取Token();
        const 请求体 = {
          ID: this.用户.编号,
          年龄: parseInt(this.用户.年龄), // 将年龄转换为整数
          性别: this.用户.性别,
          体重: parseFloat(this.用户.体重), // 将体重转换为浮点数
          身高: parseFloat(this.用户.身高), // 将身高转换为浮点数
          健康状态: this.用户.健康状况,
          饮食偏好: this.用户.饮食偏好
        };

        const 响应 = await api.post('/user/data_write', 请求体, {
          headers: {
            Authorization: `Bearer ${token}` // 通过 Authorization 头部传递 token
          }
        });

        if (响应.status === 200) {
          console.log('更新后的用户信息:', 响应.data); // 打印出响应信息
          // 更新成功后，更新 localStorage 中的用户信息
          localStorage.setItem('userInfo', JSON.stringify(this.用户));
          this.showModal = true; // 显示弹窗提醒
        }
      } catch (错误) {
        console.error('更新用户信息失败:', 错误);
        if (错误.response && 错误.response.status !== 200) {
          this.跳转到登录页面(); // 如果返回其他状态码，跳转到登录界面
        } else {
          alert('更新失败，请稍后重试。');
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