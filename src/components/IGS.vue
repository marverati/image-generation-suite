<template>
  <div class="igs">
    <!-- <ProjectTree class="grid-left" />
    <CodingArea class="grid-a" />
    <Parameters class="grid-b" />
    <PreviewArea class="grid-c" /> -->
    <div class="grid-left" />
    <div class="grid-a" />
    <div class="grid-b" />
    <div class="grid-c" />
  </div>
</template>


<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'HelloWorld',
  props: {
    msg: String,
  },
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