<template>
  <div class="igs">
    <ProjectTree class="grid-left" :project="projectState" @switchProject="switchProject" />
    <CodingArea class="grid-a" :project="projectState" />
    <Parameters class="grid-b" :project="projectState" />
    <PreviewArea class="grid-c" :project="projectState" @openPreview="openPreview()" />
    <PreviewLayer :open="previewOpen" :project="projectState" @close="closePreview()" />
  </div>
</template>


<script lang="ts">
import { defineComponent } from 'vue';
import Project from '../classes/Project';
import ProjectState from './ProjectState';
import ProjectTree from './ProjectTree.vue';
import CodingArea from './CodingArea.vue';
import Parameters from './Parameters.vue';
import PreviewArea from './PreviewArea.vue';
import PreviewLayer from './PreviewLayer.vue';

let projectReference: Project = new Project();

export default defineComponent({
  name: 'IGS',
  components: {
    ProjectTree,
    CodingArea,
    Parameters,
    PreviewArea,
    PreviewLayer
  },
  data: () => ({
    project: projectReference = new Project(),
    projectState: new ProjectState(projectReference),
    previewOpen: false
  }),
  props: {
  },
  methods: {
    openPreview() {
      this.previewOpen = true;
    },
    closePreview() {
      this.previewOpen = false;
    },
    switchProject(project: Project) {
      this.project = project;
      this.projectState.setProject(project);
      const state = this.projectState;
      this.projectState = (null as unknown as ProjectState);
      this.projectState = state;
    }
  },
  mounted() {
    this.projectState.setProject(this.project);
  },
  watch: {
  }
});
</script>

<style lang="scss">

.igs {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-areas: "l a c" "l b c";
  grid-template-columns: 1fr 2fr 2fr; 
  grid-template-rows: 2fr 1fr;

  h1 {
    text-align: center;
    font-size: 130%;
  }

  .grid-left {
    grid-area: l;
  }

  .grid-a {
    grid-area: a;
    border: 1px solid gray;
    border-top: none;
  }

  .grid-b {
    grid-area: b;
    border: 1px solid gray;
    border-top: none;
    border-bottom: none;
  }

  .grid-c {
    grid-area: c;
  }
}

</style>