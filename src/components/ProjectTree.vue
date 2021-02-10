<template>
  <div class="project-tree">
    <div class="tree-content">
      <TreeFolder :folder="projectTree" :project="projectState" />
    </div>
  </div>
</template>


<script lang="ts">
import Folder from '@/classes/Folder';
import Project from '@/classes/Project';
import TreeFolder from './subcomponents/TreeFolder.vue';
import ProjectState from './ProjectState';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ProjectTree',
  components: {
    TreeFolder
  },
  data: () => { return {
    projectState: new ProjectState()
  }},
  computed: {
    projectTree (): Folder {
      return this.project.root;
    }
  },
  props: {
    project: {
      type: Project,
      required: true
    }
  },
  watch: {
    project: function(v) {
      this.projectState.setProject(v);
    }
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