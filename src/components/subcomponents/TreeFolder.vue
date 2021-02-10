<template>
  <div class="project-tree-folder">
    <!-- Icon & Name -->
    <button class="collapse" @click="toggleCollapse">{{collapseLabel}}</button>
    <span class="icon">&#x1F4C1;</span>
    <span class="name">{{folder.name}}</span>
    <div class="folder-content" v-if="folder && folder.children && folder.children.length > 0" v-show="!collapsed">
      <TreeFolder :project="project" v-for="item in childFolders" :key="item.name" :folder="item" />
      <TreeFile :project="project" v-for="item in childFiles" :key="item.name" :snippet="item" />
    </div>
  </div>
</template>


<script lang="ts">
import Folder from '@/classes/Folder';
import Snippet from '@/classes/Snippet';
import TreeFile from './TreeFile.vue';
import { defineComponent } from 'vue';
import ProjectState from '../ProjectState';

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
  methods: {
    toggleCollapse (): void {
      this.collapsed = !this.collapsed;
    }
  },
  props: {
    folder: {
      type: Folder,
      required: true
    },
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

.project-tree-folder {

  button.collapse {
    width: 20px;
    height: 20px;
    margin-right: 4px;
    border: 1px solid #0000;
    background-color: #fff0;
    cursor: pointer;
    opacity: 0.5;
    &:hover {
      border: 1px solid #0004;
      opacity: 1;
    }
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