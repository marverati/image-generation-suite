<template>
  <div ref="slider" class="progress-slider" @mousedown="handleMouseDown">
    <div class="progress-slider-visible">
      <div class="progress-bar" :style="{width: progressPercentage}">
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { clamp } from "@/util";
import { defineComponent } from "vue";

const emptyHandler: (e: MouseEvent) => void = () => { /* noop */ };

export default defineComponent({
  name: "ProgressSlider",
  props: {
    value: {
      type: Number,
      defaultValue: 0,
      required: true
    }
  },
  data: () => ({
    dragging: false,
    boundHandleMouseMove: emptyHandler,
    boundHandleMouseUp: emptyHandler
  }),
  computed: {
    progressPercentage(): string {
      return (clamp(this.value, 0, 1) * 100) + "%";
    }
  },
  methods: {
    setProgress(p = 0) {
      this.$emit("input", p);
    },
    handleMouseDown(e: MouseEvent) {
      this.dragging = true;
      this.handleMouseMove(e);
    },
    handleMouseMove(e: MouseEvent) {
      if (this.dragging) {
        const slider = this.$refs.slider as HTMLDivElement;
        if (slider) {
          const bounds = slider.getBoundingClientRect();
          const dx = e.clientX - bounds.left;
          this.setProgress(dx / bounds.width);
        }
      }
    },
    handleMouseUp() {
      this.dragging = false;
    }
  },
  mounted () {
    this.boundHandleMouseMove = this.handleMouseMove.bind(this);
    this.boundHandleMouseUp = this.handleMouseUp.bind(this);
    document.body.addEventListener("mouseup", this.boundHandleMouseUp);
    document.body.addEventListener("mousemove", this.boundHandleMouseMove);
  }
});

</script>

<style scoped lang="scss">

.progress-slider {
  position: relative;
  display: inline-block;
  cursor: pointer;
  width: 180px;
  height: 22px;
  .progress-slider-visible {
    position: absolute;
    width: 100%;
    height: 50%;
    border: 1px solid #ccc;
    top: 25%;
    .progress-bar {
      height: 100%;
      position: absolute;
      left: 0px;
      background-color: #009000;
      &:hover {
        background-color: #00a000;
      }
    }
  }
}

</style>