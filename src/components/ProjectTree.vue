<template>
  <div class="project-tree">
    <div class="tree-content">
      <TreeFolder :folder="projectTree" :project="project" />
    </div>
  </div>
</template>


<script lang="ts">
import Folder from '@/classes/Folder';
import TreeFolder from './subcomponents/TreeFolder.vue';
import ProjectState from './ProjectState';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ProjectTree',
  components: {
    TreeFolder
  },
  data: () => { return {
  }},
  computed: {
    projectTree (): Folder {
      return this.project.getProject().root;
    }
  },
  props: {
    project: {
      type: ProjectState,
      required: true
    }
  },
  watch: {
  }
});
</script>

<style scoped lang="scss">

.project-tree {
  width: 100%;
  height: 100%;
  .tree-content {
    padding: 16px;
  }
}

</style>