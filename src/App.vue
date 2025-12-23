<template>
  <div id="app">
    <TRTCCallWindow />
  </div>
</template>

<script setup lang="ts">
import TRTCCallWindow from './components/TRTCCallWindow.vue';
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: black;
}

#app {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>