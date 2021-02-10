<template>
  <div class="preview-layer" v-if="open" @click="close()">
    <img v-if="image != null" :src="image.src" />
  </div>
</template>

<script lang="ts">
import ProjectState from './ProjectState';
import { defineComponent } from 'vue';

export default defineComponent({
  name: "PreviewLayer",
  props: {
    open: Boolean,
    project: {
      type: ProjectState,
      required: true
    }
  },
  computed: {
    image (): HTMLImageElement | null {
      console.log("receiving new preview image");
      return this.project.getPreviewImage();
    }
  },
  methods: {
    close() {
      this.$emit("close");
    }
  }
})
</script>

<style scoped lang="scss">

.preview-layer {
  width: 100vw;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  background-color: #0006;
  backdrop-filter: blur(4px);

  display: flex;
  justify-content: center;

  img {
    max-width: 95%;
    max-height: 95%;
    display: block;
    margin: auto;
    border: 1px solid #ccc;
  }
}

</style>
