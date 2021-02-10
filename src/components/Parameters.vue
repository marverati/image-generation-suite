<template>
  <div class="parameters">
      <div class="content" v-if="currentSnippet != null">
        <h1>Parameters</h1>
        <!-- TODO -->
      </div>
  </div>
</template>


<script lang="ts">
import Snippet from '@/classes/Snippet';
import ProjectState from './ProjectState';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'Parameters',
  components: {
  },
  data: () => { return {
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
  },
  watch: {
    // currentSnippet: function(s: Snippet) {
    // },
    // currentCode: function(code) {
    // }
  }
});
</script>

<style scoped lang="scss">

</style>