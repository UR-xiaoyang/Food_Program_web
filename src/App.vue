<template>
  <div id="app">
    <Header
        v-show="headerVisible"
        :class="headerClass"
        @animationend="handleAnimationEnd('header')"
    />
    <router-view @toggle-header="toggleHeader" @toggle-bottom-bar="toggleBottomBar" />
    <Bottom_bar
        v-if="!hideBottomBar"
        :class="{ 'animate__animated': true, 'animate__slideOutUp': hideBottomBar }"
        @animationend="handleAnimationEnd('bottomBar')"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import Bottom_bar from "./components/bottom_bar.vue";
import Header from "./components/header.vue";

import 'animate.css'

export default defineComponent({
  components: { Bottom_bar, Header },
  setup() {
    const hideHeader = ref(false);
    const hideBottomBar = ref(false);
    const headerVisible = ref(true); // 控制 header 的可见性
    const headerClass = ref('');

    const toggleHeader = () => {
      if (hideHeader.value) {
        headerVisible.value = true; // 显示 header
        headerClass.value = 'animate__slideInDown';
      } else {
        headerClass.value = 'animate__slideOutUp';
      }
      hideHeader.value = !hideHeader.value; // 切换状态
    };

    const toggleBottomBar = () => {
      hideBottomBar.value = !hideBottomBar.value; // 切换底部栏的显示状态
    };

    const handleAnimationEnd = (type: 'header' | 'bottomBar') => {
      if (type === 'header' && hideHeader.value) {
        headerVisible.value = false; // 隐藏 header
        headerClass.value = ''; // 重置类名
      }
    };

    return {
      hideHeader,
      hideBottomBar,
      toggleHeader,
      toggleBottomBar,
      headerVisible,
      headerClass,
      handleAnimationEnd,
    };
  },
});
</script>


<style lang="scss">
body, html, #app {
  height: 100%;
  overflow: hidden; /* 禁止页面滚动 */
  display: flex;
  flex-direction: column;
  margin: 0; /* 确保没有外边距 */
}

</style>
