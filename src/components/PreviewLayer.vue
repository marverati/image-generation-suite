<template>
  <div class="preview-layer" v-if="open" @click="close()" :class="hidden ? 'hidden' : ''"
      @keydown="handleKey">
    <img ref="img" v-if="image != null" :src="image.src" tabindex=1 />
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
  data: () => ({
    hidden: true
  }),
  computed: {
    image (): HTMLImageElement | null {
      return this.project.getPreviewImage();
    }
  },
  methods: {
    close() {
      this.hidden = true;
      setTimeout(() => {
        this.$emit("close");
      }, 500);
    },
    handleKey(e: KeyboardEvent) {
      if (e.code == "Escape") {
        this.close();
      }
    }
  },
  watch: {
    open: function(v) {
      this.hidden = true;
      if (v) {
        setTimeout(() => {
          this.hidden = false;
          (this.$refs.img as HTMLImageElement)?.focus();
        }, 50);
      }
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
  background-color: #000c;
  backdrop-filter: blur(4px);
  transition: opacity 0.5s ease;
  opacity: 1;
  &.hidden {
    opacity: 0;
  }

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
