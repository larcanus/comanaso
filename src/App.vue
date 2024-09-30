<script setup>
import FrontPage from '@/views/FrontPageView.vue'
import { provide } from 'vue'

provide('overflowXHidden', (isHidden) => {
  console.log(isHidden)
  if(isHidden) {
    document.documentElement.style.setProperty('--wb-kit-scrollbar-thumb-background-color', 'rgba(47, 46, 46, 0.7)');
    document.documentElement.style.setProperty('--wb-kit-scrollbar-track-background-color', 'rgba(47, 46, 46, 0.7)');
  }
  else {
    document.documentElement.style.setProperty('--wb-kit-scrollbar-thumb-background-color', '#007bff');
    document.documentElement.style.setProperty('--wb-kit-scrollbar-track-background-color', '#050000');
  }
  });
</script>

<template>
  <header>
  </header>

  <main>
    <FrontPage />
  </main>
</template>

<style scoped>

</style>
