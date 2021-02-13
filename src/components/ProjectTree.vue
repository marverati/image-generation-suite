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
    exportProject() {
      console.log("Exporting project...");
      try {
        // First save all snippets
        this.project.getProject().getAllSnippets().forEach(s => s.save());
        // Then generate JSON
        const obj = this.project.getProject().toJSON();
        const json = JSON.stringify(obj);
        downloadText("igs_workspace.txt", json);
        alert("Note: to import a workspace json, simply drop the txt file onto the project tree");
        console.info("Exported successfully");
      } catch(e) {
        console.error("Something went wrong, exporting failed!");
        console.error(e);
      }
    },
    save() {
      console.log("Saving project...");
      try {
        // First save all snippets
        this.project.getProject().getAllSnippets().forEach(s => s.save());
        // Then generate JSON
        const obj = this.project.getProject().toJSON();
        const json = JSON.stringify(obj);
        // Save in different slots to always persist previous few versions
        const id = (+(localStorage.getItem("slot") ?? 0) % 10) + 1;
        localStorage.setItem("slot", "" + id);
        // Save
        const slotKey = "project" + id;
        localStorage.setItem(slotKey, json);
        console.info("Saved successfully to slot " + slotKey);
      } catch(e) {
        console.error("Something went wrong, saving failed!");
        console.error(e);
      }
    },
    load(slotNum?: number): boolean {
      try {
        if (slotNum == null) {
          slotNum = +(localStorage.getItem("slot") ?? 0);
        }
        const slotKey = "project" + slotNum;
        const json = localStorage.getItem(slotKey);
        if (!json) {
          throw new Error("Stored JSON for key '" + slotKey + "' not found!");
        }
        this.loadJSON(json);
        return true;
      } catch(e) {
        console.error("Something went wrong, loading failed!");
        console.error(e);
      }
      return false;
    },
    loadJSON(json: string) {
      console.log("Trying to load json: ", json.substr(0, 32) + "...");
      if (!json) {
        return;
      }
      const obj = JSON.parse(json);
      this.loadObject(obj);
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
    handleFileDrop(event: DragEvent): void {
      event.preventDefault();
      event.stopPropagation();
      const files = event.dataTransfer?.files ?? [];
      if (files.length === 1) {
        const file = files[0];
        if (file.type === "text/plain") {
          const sure = confirm("Are you sure you want to import another igs project?"
              + " Your current project will be lost. Ensure to export it beforehand.");
          if (sure) {
            const reader = new FileReader();
            reader.onload = (e) => {
              try {
                this.loadJSON(e.target?.result as string);
                this.$nextTick(() => alert("Project imported"));
              } catch (e) {
                alert("Something went wrong during import. See console for details.");
                console.error(e);
              }
            }
            reader.readAsBinaryString(file);
          } else {
            alert("Import aborted");
          }
        } else {
          console.error("Invalid file dropped; only plain text files containing json are allowed");
        }
      } else {
        console.error("Illegal number of files dropped; just single text file allowed");
      }
      this.stopDrop();
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