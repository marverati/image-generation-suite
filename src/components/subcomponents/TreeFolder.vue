<template>
  <div class="project-tree-folder">
    <!-- Icon & Name -->
    <button class="collapse">{{collapseLabel}}</button>
    <span class="icon">&#x1F4C1;</span>
    <span class="name">{{folder.name}}</span>
    <div class="folder-content" v-if="folder && folder.children && folder.children.length > 0">
      <TreeFolder v-for="item in childFolders" :key="item.name" :folder="item" />
      <TreeFile v-for="item in childFiles" :key="item.name" :snippet="item" />
    </div>
  </div>
</template>


<script lang="ts">
import Folder from '@/classes/Folder';
import Snippet from '@/classes/Snippet';
import TreeFile from './TreeFile.vue';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'TreeFolder',
  components: {
    TreeFile: TreeFile
  },
  data: () => { return {
    collapsed: false
  }},
  computed: {
    childFolders (): Folder[] { 
      return this.folder.children.filter(child => child instanceof Folder) as Folder[];
    },
    childFiles (): Snippet[] {
      return this.folder.children.filter(child => !(child instanceof Folder)) as Snippet[]
    },
    collapseLabel (): string {
      return this.collapsed ? "+" : "-";
    }
  },
  props: {
    folder: {
      type: Folder,
      required: true
    }
  },
  watch: {
  }
});
</script>

<style scoped lang="scss">

.project-tree-folder {

  button.collapse {
    width: 20px;
    height: 20px;
    margin-right: 4px;
    border: 1px solid #666;
    cursor: pointer;
  }

  span.icon {
    margin-right: 4px;
  }

  .name {
    font-weight: bold;
  }

  .folder-content {
    margin: 4px 4px 8px 12px;
  }

}

</style>