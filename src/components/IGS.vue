<template>
  <div class="igs">
    <ProjectTree class="grid-left" :project="projectState" />
    <CodingArea class="grid-a" :project="projectState" />
    <Parameters class="grid-b" :project="projectState" />
    <PreviewArea class="grid-c" :project="projectState" />
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

let projectReference: Project = new Project();

export default defineComponent({
  name: 'IGS',
  components: {
    ProjectTree,
    CodingArea,
    Parameters,
    PreviewArea
  },
  data: () => ({
    project: projectReference = new Project(),
    projectState: new ProjectState(projectReference)
  }),
  props: {
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