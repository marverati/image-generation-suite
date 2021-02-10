<template>
  <div class="preview-area">
      <div class="content">
        <h1>Preview</h1>
        <div class="canvas-space">
          <canvas ref="previewCanvas" width=512 height=512 @click="openPreview()" />
        </div>
      </div>
  </div>
</template>


<script lang="ts">
import ProjectState from './ProjectState';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'PreviewArea',
  components: {
  },
  data: () => { return {
  }},
  computed: {
    canvas (): HTMLCanvasElement {
      return this.$refs.previewCanvas as HTMLCanvasElement;
    },
    context (): CanvasRenderingContext2D {
      return this.canvas.getContext("2d") as CanvasRenderingContext2D;
    }
  },
  props: {
    project: {
      type: ProjectState,
      required: true
    }
  },
  methods: {
    openPreview() {
      const img = new Image();
      img.onload = () => {
        this.project.setPreviewImage(img);
        this.$emit("openPreview");
      };
      img.src = this.canvas.toDataURL();
    }
  },
  watch: {
    // currentSnippet: function(s: Snippet) {
    // },
    // currentCode: function(code) {
    // }
  }
});
</script>

<style scoped lang="scss">

.preview-area {
  .content {
    display: flex;
    flex-direction: column;
    height: 100%;
    .canvas-space {
      flex-grow: 1;
      display: flex;
      justify-content: center;
      canvas {
        border: 1px solid #ccc;
        box-shadow: 0 2px 4px #aaa;
        max-height: 95%;
        max-width: 95%;
        margin: auto;
        display: block;
      }
    }
  }
}

</style>