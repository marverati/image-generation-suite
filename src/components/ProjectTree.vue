<template>
  <div class="project-tree">
    <div class="tree-toolbar">
      <span class="save-button" @click="save()">Save</span>
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
import Project from '@/classes/Project';
import { exposeToWindow } from '@/util';

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
  methods: {
    // eslint-disable-next-line @typescript-eslint/ban-types
    openSnippet(payload: Object): void {
      console.log("Opening using ", payload);
      const snippet = (payload as any).snippet;
      if (snippet) {
        this.project.openSnippet(snippet);
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
    load(slotNum?: number) {
      try {
        if (slotNum == null) {
          slotNum = +(localStorage.getItem("slot") ?? 0);
        }
        const slotKey = "project" + slotNum;
        const json = localStorage.getItem(slotKey);
        if (!json) {
          throw new Error("Stored JSON for key '" + slotKey + "' not found!");
        }
        const obj = JSON.parse(json);
        console.log("Loaded ", obj);
        const project = Project.fromJSON(obj);
        console.log("Created ", project);
        this.$emit("switchProject", project);
      } catch(e) {
        console.error("Something went wrong, loading failed!");
        console.error(e);
      }
    }
  },
  mounted () {
    exposeToWindow({ loadFromLocalStorage: this.load.bind(this) });
    this.load();
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
  .tree-content {
    padding: 16px;
    padding-top: 32px;
  }

  .save-button {
    position: absolute;
    right: 0;
    top: 0;
    cursor: pointer;
    &:hover {
      color: black;
      font-weight: bold;
    }
  }
}

</style>