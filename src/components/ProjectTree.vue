<template>
  <div :class="{ 'project-tree': true, 'drop': isDropping }"
      @drop.prevent="handleFileDrop" @dragover.prevent @dragenter="isDropping = true" @dragleave="stopDrop" @dragend="stopDrop">
    <div class="tree-toolbar">
      <span class="save-button" @click="save()">Save</span>
      <span class="export-button" @click="exportProject()">Export</span>
    </div>
    <div class="tree-content">
      <TreeFolder :folder="projectTree" :project="project" @openSnippet="openSnippet"/>
    </div>
  </div>
</template>


<script lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import Folder from '@/classes/Folder';
import TreeFolder from './subcomponents/TreeFolder.vue';
import ProjectState from './ProjectState';
import { defineComponent } from 'vue';
import Project, { ProjectJSON } from '@/classes/Project';
import { downloadText, exposeToWindow } from '@/util';
import { projectStorageManager } from '@/classes/ProjectStorageManager';
import { importExportStorage } from '@/classes/ProjectStorageSetup';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const initialJson = require('@/assets/exampleProject.json');

export default defineComponent({
  name: 'ProjectTree',
  components: {
    TreeFolder
  },
  data: () => { return {
    isDropping: false
  }},
  computed: {
    projectTree (): Folder {
      return this.project.getProject().root;
    }
  },
  methods: {
    // eslint-disable-next-line @typescript-eslint/ban-types
    openSnippet(payload: Object): void {
      const snippet = (payload as any).snippet;
      if (snippet) {
        this.project.openSnippet(snippet);
      }
    },
    async exportProject() {
      console.log("Exporting project...");
      try {
        // First save all snippets
        const project = this.project.getProject();
        project.getAllSnippets().forEach(s => s.save());
        await importExportStorage.store(project);
        setTimeout(() => alert("Note: to import a workspace json, simply drop the txt file onto the project tree"), 1000);
        console.info("Exported successfully");
      } catch(e) {
        console.error("Something went wrong, exporting failed!");
        console.error(e);
      }
    },
    async save() {
      console.log("Saving project...");
      try {
        const project = this.project.getProject();
        project.getAllSnippets().forEach(s => s.save());
        await projectStorageManager.store(project);
      } catch(e) {
        console.error("Something went wrong, saving failed!");
        console.error(e);
      }
    },
    async load(): Promise<boolean> {
      try {
        const project = await projectStorageManager.load("project");
        if (project) {
          this.$emit("switchProject", project);
          return true;
        }
      } catch(e) {
        console.error("Something went wrong, loading failed!");
        console.error(e);
      }
      return false;
    },
    loadObject(obj: ProjectJSON) {
      const project = Project.fromJSON(obj);
      this.$emit("switchProject", project);
    },
    resetProject() {
      this.loadObject(initialJson);
      this.project.openSnippet(null);
    },
    safeResetProject() {
      if (confirm("Are you sure you want to reset your project? All your work will be lost!"
          + " If you have important changes, click 'No' and Export your project first.")) {
        this.resetProject();
      }
    },
    async handleFileDrop(event: DragEvent) {
      this.stopDrop();
      try {
        const project = await importExportStorage.importDroppedFile(event);
        if (project) {
          this.$emit("switchProject", project);
          this.$nextTick(() => alert("Project imported"));
        }
      } catch(e) {
        alert(e);
      }
    },
    stopDrop(): void {
      this.isDropping = false;
    }
  },
  mounted () {
    exposeToWindow({ loadFromLocalStorage: this.load.bind(this), resetProject: this.safeResetProject.bind(this) });
    if (!this.load()) {
      this.resetProject();
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
  position: relative;
  width: 100%;
  height: 100%;
  transition: box-shadow 0.5s ease;
  
  &.drop {
    box-shadow: inset 0 0 12px blue;
  }
  
  .tree-content {
    padding: 16px;
    padding-top: 32px;
  }

  .tree-toolbar {

    span {
      position: absolute;
      top: 0;
      cursor: pointer;
      &:hover {
        color: black;
        font-weight: bold;
      }
    }
    .save-button {
      right: 0px;
    }
    .export-button {
      right: 50px;
    }
  }
}

</style>