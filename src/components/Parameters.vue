<template>
  <div class="parameters">
      <div class="content" v-if="currentSnippet != null">
        <h1>Parameters</h1>
        <div class="parameter" v-for="param in params" :key="param.label">
          <label>{{param.label}}</label>
          <!-- Num Slider -->
          <!-- Num Input -->
          <!-- Checkbox -->
          <!-- Enum -->
          <!-- String Input -->
        </div>
      </div>
  </div>
</template>


<script lang="ts">
import Snippet, { SnippetParameter } from '@/classes/Snippet';
import ProjectState from './ProjectState';
import { defineComponent } from 'vue';
import '../imaging/parameters';
import { useProject } from '../imaging/parameters';
import { initial } from '@/util';

const emptyParams: SnippetParameter[] = [];

export default defineComponent({
  name: 'Parameters',
  components: {
  },
  data: () => { return {
    params: emptyParams
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
    updateParameters() {
      console.log("updating parameters!");
      if (!this.currentSnippet) {
        return;
      }
      this.params = this.currentSnippet.getParams();
      console.log("Parameters now: ", this.params.map(p => p.label + " - " + p.value));
    }
  },
  watch: {
    currentSnippet: function(s: Snippet, prev: Snippet) {
      if (prev) {
        prev.ubsubscribeFromParameterChanges(this.updateParameters, this);
      }
      if (s) {
        s.subscribeToParameterChanges(this.updateParameters, this);
      }
      this.updateParameters();
    },
    project: initial(function(project) {
      useProject(project);
    })
  }
});
</script>

<style scoped lang="scss">

  .parameters {

    .parameter {
      display: block;
    }

  }

</style>