<template>
  <div class="project-tree">
    <TreeFolder :folder="projectTree" />
  </div>
</template>


<script lang="ts">
import Folder from '@/classes/Folder';
import Project from '@/classes/Project';
import TreeFolder from './subcomponents/TreeFolder.vue';
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
  }
});
</script>

<style scoped lang="scss">

.project-tree {
  width: 100%;
  height: 100%;
  padding: 16px;
}

</style>