<template>
  <IGS />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import IGS from './components/IGS.vue';

export default defineComponent({
  name: 'App',
  components: {
    IGS
  }
});
</script>

<style lang="scss">
body {
  margin: 0;
}

#app {
  height: 100vh;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>
