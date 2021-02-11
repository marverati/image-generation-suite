<template>
  <div class="project-tree-file" @click="loadSnippet" :class="isActive ? 'highlight' : ''">
    <!-- Icon & Name -->
    <span class="icon">&#x1F5CE;</span>
    <span class="name">{{snippet.name}}</span>
    <span v-if="isDirty">&nbsp;*</span>
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
    isActive (): boolean { return this.project.getOpenSnippet() === this.snippet; },
    isDirty (): boolean { return this.snippet.isDirty(); }
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
    margin: 2px 0px 2px 12px;
    cursor: pointer;
    .icon {
      margin-left: 15px;
      margin-right: 7px;
    }
    &:hover {
      background-color: #f4f4ff;
    }
    &.highlight {
      background-color: #dadaff;
    }
  }


</style>