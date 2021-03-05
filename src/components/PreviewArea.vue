<template>
  <div class="preview-area" @drop.prevent="handleFileDrop" @dragover.prevent>
      <div class="content" ref="content"
          @dragenter="startDrop()">
        <h1>Preview</h1>
        <div class="canvas-space">
          <div class="canvas-div">
            <canvas ref="previewCanvas" width=812 height=512 @click="openPreview()" @resize="handleResize()"
                :class="{ 'alpha-background': showBackground, dropping: isDropping }" tabindex="1" />
            <!-- Animation controls -->
            <div :class="{'canvas-settings-spacing': true, 'animation': true, 'hidden': !animationStarted, 'offset': !animationStarted}">
              <div class="spacing" />
              <div class="canvas-settings">
                <progress-slider :value="animationProgress" @input="forwardAnimationProgress" />
                <button @click="toggleAnimation()" v-html="togglePauseLabel"></button>
                <button @click="stopAnimation()">&#x23F9;</button>
                <select name="animation-speed" v-model="animationSpeed">
                  <option v-for="speed in animationSpeeds" :key="speed" :value="speed">x{{speed}}</option>
                </select>
              </div>
              <div class="spacing" />
            </div>
            <!-- Canvas Setting -->
            <div :class="{'canvas-settings-spacing': true, 'settings': true, 'offset': !animationStarted}">
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
      <div class="drop-overlay" v-show="isDropping" @dragleave="stopDrop()" @dragend="stopDrop()"> </div>
  </div>
</template>


<script lang="ts">
import ProjectState from './ProjectState';
import ProgressSlider from './subcomponents/ProgressSlider.vue';
import { defineComponent } from 'vue';

import { useCanvas, animator } from '@/imaging/imageUtil';

const dummyCanvas = document.createElement("canvas");

export default defineComponent({
  name: 'PreviewArea',
  components: {
    ProgressSlider
  },
  data: () => { return {
    showBackground: true,
    canvas: dummyCanvas,
    updater: 0,
    isDropping: false,
    dragCount: 0,
    animationStarted: false,
    animationRunning: false,
    animationProgress: 0,
    animationSpeed: "1",
    animationSpeeds: [ "0.125", "0.25", "0.5", "0.75", "1", "1.25", "1.5", "2", "3", "4", "8", "16", "32" ].reverse()
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
    },
    togglePauseLabel (): string {
      return this.animationRunning ? "&#x23f8;" : "&#x25B6;";
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
      // Don't react to canvas clicks if animation is running, then animation code determines mouse interaction
      if (this.animationStarted) {
        return;
      }
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
    },
    startDrop() {
      this.isDropping = true;
    },
    stopDrop() {
      this.isDropping = false;
    },
    handleFileDrop(event: DragEvent) {
      event.preventDefault();
      event.stopPropagation();
      const files = event.dataTransfer?.files ?? [];
      const file = files[0];
      if (file.type.match(/image.*/)) {
        const reader = new FileReader();
        reader.onload = (loadEvent) => {
          const img = document.createElement('img') as HTMLImageElement;
          img.onload = () => {
            console.log("Loaded image: " + file.name);
            this.applyImage(img);
          }
          img.src = loadEvent.target?.result as string;
        }
        reader.readAsDataURL(file);
      }
      this.stopDrop();
    },
    applyImage(img: HTMLImageElement): void {
      if (img && img.naturalWidth > 0 && img.naturalHeight > 0) {
        this.canvas.width = img.naturalWidth;
        this.canvas.height = img.naturalHeight;
        const ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
        ctx.save();
        ctx.globalCompositeOperation = "copy";
        ctx.drawImage(img, 0, 0);
        ctx.restore();
      }
    },
    updateAnimationState(started: boolean, running: boolean) {
      this.animationStarted = started;
      this.animationRunning = running;
      this.animationSpeed = "" + animator.getAnimationSpeed();
      return false;
    },
    updateAnimationProgress(p: number) {
      this.animationProgress = p;
      return false;
    },
    toggleAnimation() {
      if (this.animationRunning) {
        animator.pauseAnimation();
      } else {
        animator.resumeAnimation();
      }
    },
    stopAnimation() {
      animator.stopAnimation();
    },
    forwardAnimationProgress(p: number) {
      animator.setAnimationProgress(p);
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
    },
    animationSpeed: function(s, prev) {
      if (s !== prev) {
        animator.setAnimationSpeed(+s);
      }
    }
  },
  mounted () {
    this.canvas = this.$refs.previewCanvas as HTMLCanvasElement;
    useCanvas(this.canvas);
    setInterval(() => this.forceUpdate(), 5000);
    animator.registerAnimationStateListener(this.updateAnimationState.bind(this));
    animator.registerAnimationProgressListener(this.updateAnimationProgress.bind(this));
  }
});
</script>

<style scoped lang="scss">

.preview-area {
  position: relative;
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
          filter: none;
          // box-shadow: inset 0 0 0px green;
          transition: box-shadow 0.3s ease, filter 0.3s ease;

          &.alpha-background {
            // background-position: 0 0;
            // background-repeat: repeat;
            // background-size: 4%;
            // background-image: url('~@/assets/checker.png');
            background: repeating-conic-gradient(#808080 0% 25%, transparent 0% 50%) 
              50% / 20px 20px
          }
          &.dropping {
            box-shadow: inset 0 0 12px green;
            filter: blur(2px);
          }
        }

        .canvas-settings-spacing {
          display: flex;
          justify-content: center;
          transition: opacity 0.5s ease, transform 0.5s ease;
          opacity: 1;
          transform: translate(0px, 0px);
          z-index: -1;

          &.hidden {
            opacity: 0;
          }

          &.offset {
            transform: translate(0px, -32px);
          }

          .spacing {
            flex-grow: 1;
          }

          &.animation {
            button, select, div {
              vertical-align: middle;
              margin-left: 4px;
              margin-right: 4px;
            }
            button {
              display: inline-block;
              font-size: 100%;
              width: 32px;
              border: 1px solid #ccc;
              margin: 4px;
              height: 21px;
            }
            select {
              font-size: 65%;
            }
            .canvas-settings {
              border: none;
            }
          }
        }

        .canvas-settings {
          display: block;
          border: 1px solid #ccc;
          border-radius: 2px;
          margin: 12px auto 0 auto;
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

  .drop-overlay {
    background-color: #0008;
    height: 100%;
    width: 100%;
    position: absolute;
    left: 0;
    top: 0;
  }
}

</style>