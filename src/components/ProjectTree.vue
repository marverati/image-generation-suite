<template>
  <div class="project-tree">
    <div class="tree-content">
      <TreeFolder :folder="projectTree" :project="project" />
    </div>
    <span class="save-button" @click="save()">Save</span>
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
  methods: {
    save() {
      console.log("Saving...");
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
        console.info("Saved successfully");
      } catch(e) {
        console.error("Something went wrong, saving failed!");
        console.error(e);
      }
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
  .tree-content {
    padding: 16px;
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