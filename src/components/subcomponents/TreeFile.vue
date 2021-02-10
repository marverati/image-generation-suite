<template>
  <div class="project-tree-file" @click="loadSnippet" :class="isActive ? 'highlight' : ''">
    <!-- Icon & Name -->
    <span class="icon">&#x1F5CE;</span>
    <span class="name">{{snippet.name}}</span>
  </div>
</template>


<script lang="ts">
import Snippet from '@/classes/Snippet';
import { defineComponent } from 'vue';
import ProjectState from '../ProjectState';

export default defineComponent({
  name: 'TreeFile',
  data: () => { return {
  }},
  computed: {
    isActive (): boolean { return this.project.getOpenSnippet() === this.snippet; }
  },
  props: {
    snippet: {
      type: Snippet,
      required: true
    },
    project: {
      type: ProjectState,
      required: true
    }
  },
  methods: {
    loadSnippet() {
      this.project.openSnippet(this.snippet);
    }
  },
  watch: {
  }
});
</script>

<style scoped lang="scss">

  .project-tree-file {
    margin-bottom: 2px;
    cursor: pointer;
    .icon {
      margin-left: 15px;
      margin-right: 7px;
    }
    &:hover {
      text-decoration: underline;
      background-color: #f0f0ff;
    }
    &.highlight {
      background-color: #d0d0ff;
    }
  }


</style>