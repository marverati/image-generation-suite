<template>
  <div class="preview-area">
      <div class="content">
        <h1>Preview</h1>
        <div class="canvas-space">
          <div class="canvas-div">
            <canvas ref="previewCanvas" width=812 height=512 @click="openPreview()"
                :class="showBackground ? 'alpha-background' : ''" />
            <!-- Canvas Setting -->
            <div class="canvas-settings">
              <button @click="toggleBackground()">{{toggleBackgroundLabel}}</button>
            </div>
          </div>
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
    showBackground: true
  }},
  computed: {
    canvas (): HTMLCanvasElement {
      return this.$refs.previewCanvas as HTMLCanvasElement;
    },
    context (): CanvasRenderingContext2D {
      return this.canvas.getContext("2d") as CanvasRenderingContext2D;
    },
    toggleBackgroundLabel (): string {
      return this.showBackground ? "Hide Alpha Background" : "Show Alpha Background";
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
    },
    toggleBackground() {
      this.showBackground = !this.showBackground;
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
      position: relative;

      .canvas-div {
        margin: auto;
        display: block;
        max-width: 100%;
        max-height: 80%;
        
        canvas {
          // border: 1px solid #ccc;
          box-shadow: 0 2px 4px #aaa;
          max-height: 95%;
          max-width: 95%;
          margin: auto;
          display: block;
          cursor: pointer;

          &.alpha-background {
            // background-position: 0 0;
            // background-repeat: repeat;
            // background-size: 4%;
            // background-image: url('~@/assets/checker.png');
            background: repeating-conic-gradient(#808080 0% 25%, transparent 0% 50%) 
              50% / 20px 20px
          }
        }

        .canvas-settings {
          display: block;
          border: 1px solid #ccc;
          border-radius: 2px;
          margin: 12px auto;
          padding: 4px;
          position: absolute;
          left: 50%;
          transform: translate(-50%, 0);

          button {
            font-size: 60%;
            cursor: pointer;
          }
        }
      }
    }
  }
}

</style>