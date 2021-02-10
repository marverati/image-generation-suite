<template>
  <div class="igs">
    <!--
    <CodingArea class="grid-a" />
    <Parameters class="grid-b" />
    <PreviewArea class="grid-c" /> -->
    <ProjectTree class="grid-left" :project="projectState" />
    <CodingArea class="grid-a" :project="projectState" />
    <div class="grid-b" />
    <div class="grid-c" />
  </div>
</template>


<script lang="ts">
import { defineComponent } from 'vue';
import Project from '../classes/Project';
import ProjectState from './ProjectState';
import ProjectTree from './ProjectTree.vue';
import CodingArea from './CodingArea.vue';

let projectReference: Project = new Project();

export default defineComponent({
  name: 'IGS',
  components: {
    ProjectTree,
    CodingArea
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

<style scoped lang="scss">

.igs {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-areas: "l a c" "l b c";
  grid-template-columns: 1fr 2fr 2fr; 

  div {
    min-width: 100px;
    min-height: 100px;
  }
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

</style>