<template>
  <div v-if="isVisible" class="modal-overlay" @click.self="close"> <!-- Use isVisible prop -->
    <div class="modal-content">
      <button class="close-button" @click="close">×</button>
      <slot></slot> <!-- Changed to default slot -->
      <!-- Removed the modal-actions div and its buttons -->
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  isVisible: { // Changed prop name from modelValue to isVisible
    type: Boolean,
    required: true
  }
});

// Define only the close event
const emit = defineEmits(['close']);

const close = () => {
  emit('close'); // Emit 'close' event
};

// Removed confirm function and related emit
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  position: relative;
  max-width: 400px;
  width: 100%;
}

.close-button {
  position: absolute;
  top: 10px;
  right: 10px;
  background: transparent;
  border: none;
  font-size: 20px;
  cursor: pointer;
}

/* Removed styles for modal-actions, cancel-button, confirm-button */
</style>
