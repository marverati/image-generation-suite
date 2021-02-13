<template>
  <div class="parameters">
      <div class="content" v-if="currentSnippet != null">
        <h1>Parameters</h1>
        <!-- Refreshing -->
        <label>Auto refresh:</label>
        <input type="checkbox" v-model="autoRefresh" :disabled="params.length <= 0" />
        <button :disabled="autoRefresh" @click="refresh()">&#128472;</button>
        <div class="parameter" v-for="param in params" :key="param.label">
          <label>{{param.label}}:</label>
          <!-- Num Slider -->
          <input v-if="param.type == 'range'" :min="param.object.min" :max="param.object.max"
              :step="param.object.step" type="range" v-model="param.value" @change="refresh()" />
          <!-- Num Input -->
          <input v-if="param.type == 'number'" :min="param.object.min" :max="param.object.max"
              :step="param.object.step" v-model="param.value" />
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
    params: emptyParams,
    autoRefresh: true
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
      if (!this.currentSnippet) {
        return;
      }
      this.params = this.currentSnippet.getParams();
    },
    refresh() {
      this.project.runCode();
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

    label {
      display: inline-block;
      width: 140px;
      text-overflow: ellipsis;
      overflow: hidden;
      text-align: right;
      margin-right: 16px;
      margin-left: 8px;
    }

    button {
      margin-left: 48px;
      margin-bottom: 16px;
      position: relative;
      top: -4px;
    }

    .parameter {
      display: block;
    }

  }

</style>