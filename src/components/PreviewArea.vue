<template>
  <div class="preview-area">
      <div class="content">
        <h1>Preview</h1>
        <div class="canvas-space">
          <div class="canvas-div">
            <canvas ref="previewCanvas" width=812 height=512 @click="openPreview()" @resize="handleResize()"
                :class="showBackground ? 'alpha-background' : ''" />
            <!-- Canvas Setting -->
            <div class="canvas-settings-spacing">
              <div class="spacing" />
              <div class="canvas-settings">
                <span class="size">{{sizeLabel}}</span>
                <span class="scale">{{scaleLabel}}</span>
                <button @click="toggleBackground()">{{toggleBackgroundLabel}}</button>
              </div>
              <div class="spacing" />
            </div>
          </div>
        </div>
      </div>
  </div>
</template>


<script lang="ts">
import ProjectState from './ProjectState';
import { defineComponent } from 'vue';

import { useCanvas } from '@/imaging/imageUtil';

const dummyCanvas = document.createElement("canvas");

export default defineComponent({
  name: 'PreviewArea',
  components: {
  },
  data: () => { return {
    showBackground: true,
    canvas: dummyCanvas,
    updater: 0
  }},
  computed: {
    context (): CanvasRenderingContext2D {
      return this.canvas?.getContext("2d") as CanvasRenderingContext2D;
    },
    toggleBackgroundLabel (): string {
      return this.showBackground ? "Hide Alpha Background" : "Show Alpha Background";
    },
    sizeLabel (): string {
      if (this.updater == null) { return ''; }
      return `${this.canvas.width}x${this.canvas.height} px`;
    },
    scaleLabel (): string {
      if (this.updater == null) { return ''; }
      const f = this.canvas.offsetWidth / this.canvas.width;
      return "Zoom = " + Math.round(100 * f) + "%";
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
    },
    handleResize() {
      this.forceUpdate();
    },
    forceUpdate() {
      this.updater++;
    }
  },
  watch: {
    canvas: function(c) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).previewCanvas = c;
    },
    context: function(c) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).previewContext = c;
    }
  },
  mounted () {
    this.canvas = this.$refs.previewCanvas as HTMLCanvasElement;
    useCanvas(this.canvas);
    setInterval(() => this.forceUpdate(), 5000);
  }
});
</script>

<style scoped lang="scss">

.preview-area {
  padding: 16px;
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
          max-width: 100%;
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

        .canvas-settings-spacing {
          display: flex;
          justify-content: center;

          .spacing {
            flex-grow: 1;
          }
        }

        .canvas-settings {
          display: block;
          border: 1px solid #ccc;
          border-radius: 2px;
          margin: 12px auto;
          padding: 4px;
          display: inline-block;

          span {
            margin: 0px 20px;
            font-size: 70%;
          }

          button {
            display: inline-block;
            font-size: 60%;
            cursor: pointer;
          }
        }
      }
    }
  }
}

</style>