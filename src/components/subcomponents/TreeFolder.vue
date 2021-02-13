<template>
  <div class="project-tree-folder">
    <!-- Icon & Name -->
    <div class="folder-line">
      <button :class="{collapse: true, hidden: isEmpty}"
          @click="toggleCollapse" :disabled="isEmpty">{{collapseLabel}}</button>
      <span class="icon">&#x1F4C1;</span>
      <span class="name">{{folder.name}}</span>
      <span class="icon new-folder" @click="newSubfolder()">+&#x1F4C1;</span>
      <span class="icon new-snippet" @click="newSnippet()">+&#x1F5CE;</span>
    </div>
    <div class="folder-content" v-if="folder && folder.children && folder.children.length > 0" v-show="!collapsed">
      <TreeFolder :project="project" v-for="item in childFolders" :key="item.name" :folder="item"
          @openSnippet="propagateOpenSnippet" />
      <TreeFile :project="project" v-for="item in childFiles" :key="item.name" :snippet="item" />
    </div>
  </div>
</template>


<script lang="ts">
/* eslint-disable @typescript-eslint/ban-types */
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
    },
    isEmpty (): boolean {
      return this.folder.children.length <= 0;
    }
  },
  methods: {
    propagateOpenSnippet (payload: Object): void {
      this.$emit("openSnippet", payload);
    },
    toggleCollapse (): void {
      this.collapsed = !this.collapsed;
    },
    newSubfolder(): void {
      const name = prompt(this.folder.getPath() + " -> subfolder name:");
      if (name) {
        if (this.folder.hasChild(name)) {
          alert("Child with that name already exists in folder!");
        } else {
          const folder = new Folder(name, this.folder.getProject());
          this.folder.append(folder);
        }
      }
    },
    newSnippet(): void {
      const name = prompt(this.folder.getPath() + " -> snippet name:");
      if (name) {
        if (this.folder.hasChild(name)) {
          alert("Child with that name already exists in folder!");
        } else {
          const snippet = new Snippet(name, this.folder.getProject());
          this.folder.append(snippet);
          console.log(1);
          this.$emit("openSnippet", { snippet });
          console.log(2);
        }
      }
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

  .folder-line {
    position: relative;

    &:hover {
      .new-folder, .new-snippet {
        opacity: 1 !important;
      }
    }

    button.collapse {
      width: 20px;
      height: 20px;
      margin-right: 4px;
      border: 1px solid #0000;
      background-color: #fff0;
      cursor: pointer;
      opacity: 0.5;
      &:hover:not(.hidden) {
        border: 1px solid #0004;
        opacity: 1;
      }
      &.hidden {
        opacity: 0;
        cursor: initial;
      }
    }

    .icon {
      margin-right: 4px;

      &.new-folder, &.new-snippet {
        position: absolute;
        display: inline-block;
        border: 1px solid #ccc0;
        cursor: pointer;
        opacity: 0;
        transition: opacity 0.2s ease;
        &:hover {
          border-color: #ccc;
          background-color: #ddf;
        }
      }
      &.new-folder {
        right: 30px;
      }
      &.new-snippet {
        right: 0px;
      }
    }

    .name {
      font-weight: bold;
    }
  }


  .folder-content {
    margin: 4px 0px 8px 12px;
  }

}

</style>