<template>
  <div class="igs">
    <!--
    <CodingArea class="grid-a" />
    <Parameters class="grid-b" />
    <PreviewArea class="grid-c" /> -->
    <ProjectTree class="grid-left" :project="project" />
    <div class="grid-a" />
    <div class="grid-b" />
    <div class="grid-c" />
  </div>
</template>


<script lang="ts">
import { defineComponent } from 'vue';
import Project from '../classes/Project';
import ProjectTree from './ProjectTree.vue';

export default defineComponent({
  name: 'IGS',
  components: {
    ProjectTree
  },
  data: () => ({
    project: new Project()
  }),
  props: {
  },
  mounted() {
    setTimeout(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).project = this.project;
    })
  },
  watch: {
    'project': function()  {
      console.log("Project updated");
    }
  }
});
</script>

<style scoped lang="scss">

.igs {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-areas: "l a c" "l b c";

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