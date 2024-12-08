<script>
import { defineComponent } from "vue";
import { Construction } from "lucide-vue-next";

export default defineComponent({
  name: "UnderConstruction",
  components: {
    ConstructionIcon: Construction,
  },
  props: {
    pageName: {
      type: String,
      required: true,
    },
  },
});
</script>

<template>
  <div class="flex flex-col h-full bg-gray-100 dark:bg-gray-900">
    <!-- Top warning stripe -->
    <div
        class="h-8 animate-scroll-left"
        :style="{
        backgroundImage: 'repeating-linear-gradient(45deg, #000000, #000000 10px, #ff0000 10px, #ff0000 20px)',
        backgroundSize: '28px 28px',
      }"
    ></div>

    <!-- Main content -->
    <div class="flex-grow flex flex-col items-center justify-center p-4">
      <ConstructionIcon class="w-16 h-16 mb-4 text-red-600 animate-pulse" />
      <h1 class="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2 text-center">
        正在开发中
      </h1>
      <p class="text-xl text-gray-600 dark:text-gray-400 mb-4 text-center">
        {{ pageName }} 页面正在建设中
      </p>
      <p class="text-sm text-gray-500 dark:text-gray-500 text-center">
        请稍后再来查看
      </p>
    </div>

    <!-- Bottom warning stripe -->
    <div
        class="h-8 animate-scroll-right"
        :style="{
        backgroundImage: 'repeating-linear-gradient(-45deg, #000000, #000000 10px, #ff0000 10px, #ff0000 20px)',
        backgroundSize: '28px 28px',
      }"
    ></div>
  </div>
</template>

<style scoped>
/* Add animations for scrolling stripes */
@keyframes scroll-left {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: -56px 0;
  }
}

@keyframes scroll-right {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 56px 0;
  }
}

.animate-scroll-left {
  animation: scroll-left 1s linear infinite;
}

.animate-scroll-right {
  animation: scroll-right 1s linear infinite;
}

/* Ensure the container adapts to content size */
.flex-grow {
  flex: 1 0 auto;
}
</style>
