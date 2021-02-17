<template>
  <div class="code-area">
      <div class="content" v-if="currentSnippet != null" @keydown="handleKey">
        <h1>{{currentSnippet.name}}</h1>
        <textarea class="code" v-model="currentCode" wrap="off" />
      </div>
  </div>
</template>


<script lang="ts">
import Snippet from '@/classes/Snippet';
// import Project from '@/classes/Project';
import ProjectState from './ProjectState';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'CodingArea',
  components: {
  },
  data: () => { return {
    currentCode: ""
  }},
  computed: {
    currentSnippet(): Snippet | null {
      return this.project.getOpenSnippet();
    }
  },
  props: {
    project: {
      type: ProjectState,
      required: true
    }
  },
  methods: {
    handleKey(e: KeyboardEvent) {
      if (e.code === "Enter" && e.ctrlKey) {
        this.runCode();
      }
    },
    runCode(): void {
      this.project.runCode();
    }
  },
  watch: {
    currentSnippet: function(s: Snippet) {
      this.currentCode = s ? s.getCode() : "";
    },
    currentCode: function(code) {
      this.currentSnippet?.setCode(code);
    }
  }
});
</script>

<style scoped lang="scss">

.code-area {
  padding: 8px;

  .content {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;

    .code {
      padding: 8px;
      flex-grow: 1;
      font-family: "Courier New", monospace;
    }
  }

}


</style>