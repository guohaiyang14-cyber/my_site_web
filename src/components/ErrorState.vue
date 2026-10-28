<script setup>
defineProps({
  error: { type: Object, required: true },
  retry: { type: Function, default: null },
});
</script>

<template>
  <div class="state state--error" role="alert">
    <h3>请求失败</h3>
    <p><code class="error-code">{{ error.code }}</code></p>
    <p>{{ error.message }}</p>
    <ul v-if="error.details?.length" class="error-details">
      <li v-for="(d, i) in error.details" :key="i">{{ d }}</li>
    </ul>
    <button v-if="retry" @click="retry">重试</button>
  </div>
</template>