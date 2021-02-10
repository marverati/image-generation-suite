<template>
  <div class="project-tree-file">
    <!-- Icon & Name -->
    <span class="icon">&#x1F5CE;</span>
    <span class="name">{{snippet.name}}</span>
  </div>
</template>


<script lang="ts">
import Snippet from '@/classes/Snippet';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'TreeFile',
  data: () => { return {
  }},
  computed: {
  },
  props: {
    snippet: {
      type: Snippet,
      required: true
    }
  },
  watch: {
  }
});
</script>

<style scoped lang="scss">

  .project-tree-file {
    margin-bottom: 2px;
    .icon {
      margin-left: 15px;
      margin-right: 7px;
    }
  }


</style>