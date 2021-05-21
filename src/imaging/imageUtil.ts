/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { exposeToWindow } from '@/util';
import './ArrayExtension';
import './color';
import { blendManyColors } from './color';
import './interpolation';
import './ColorGradient';
import './perlin';
import { Filter, filter } from './filter';
import Animator from './Animator';

declare global {
  interface HTMLCanvasElement {
    use(): this;
  }
}

HTMLCanvasElement.prototype.use = function() {
  useCanvas(this);
  return this;
}


export let currentCanvas: HTMLCanvasElement = document.createElement("canvas");
export let currentContext: CanvasRenderingContext2D = currentCanvas.getContext("2d") as CanvasRenderingContext2D;

export const animator = new Animator(getPreviewCanvas);
const animate = animator.animate.bind(animator);

let clipX = 0, clipY = 0, clipW = Infinity, clipH = Infinity;

export type ColorRGB = [number, number, number];
export type ColorRGBA = [number, number, number, number];
export type CssColor = ColorRGB | ColorRGBA | number | string; 
export type Generator = ((x: number, y: number) => number) | ((x: number, y: number) => ColorRGB)
    | ((x: number, y: number) => ColorRGBA);

export function useCanvas(canvas: HTMLCanvasElement = getPreviewCanvas()) {
  currentCanvas = canvas;
  currentContext = canvas.getContext("2d") as CanvasRenderingContext2D;
  clipRect();
  return canvas;
} 

export function createCanvas(w = currentCanvas.width, h = w): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}

export function cloneCanvas(canvas = currentCanvas): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = canvas.width;
  c.height = canvas.height;
  const ctx = c.getContext("2d");
  ctx?.drawImage(canvas, 0, 0);
  return c;
}

export function getCanvas(): HTMLCanvasElement {
  return currentCanvas;
}

export function getPreviewCanvas(): HTMLCanvasElement {
  return (window as any).previewCanvas;
}

export function getContext(): CanvasRenderingContext2D {
  return currentContext;
}

export function clipRect(x = 0, y = 0, w = Infinity, h = Infinity, applyToContext = false): void {
  clipX = Math.max(x, 0) << 0;
  clipY = Math.max(y, 0) << 0;
  clipW = Math.min(w, currentCanvas.width - x) << 0;
  clipH = Math.min(h, currentCanvas.height - y) << 0;
  if (applyToContext) {
    // Note: if applied to context, caller must make sure to use .save() and .restore() in order to get rid of
    // clipping at a later point in time. Sadly, canvas API is severely lacking in this regard and I have no
    // way to clear/reset/change clipping myself, it's a destructive operation. So I need this flag and cautious
    // usage. Sad!
    currentContext.beginPath();
    currentContext.rect(clipX, clipY, clipW, clipH);
    currentContext.clip();
  }
}

export function clipRel(x = 0, y = 0, w = 1, h = 1, applyToContext?: boolean): void {
  const cw = currentCanvas.width, ch = currentCanvas.height;
  clipRect(x * cw, y * ch, w * cw, h * ch, applyToContext);
}

export function getClipping(): number[] {
  return [clipX, clipY, clipW, clipH];
}

export function setSize(w = 512, h = w): void {
  currentCanvas.width = Math.round(w);
  currentCanvas.height = Math.round(h);
  clipRect();
  // clipRect(clipX, clipY, clipW, clipH);
  currentCanvas.dispatchEvent(new Event("resize"));
}

export function scaleFast(scalex = 1, scaley = scalex, keepContent = true) {
  if (keepContent) {
    const cnv = cloneCanvas(currentCanvas);
    setSize(currentCanvas.width * scalex, currentCanvas.height * scaley);
    currentContext.drawImage(cnv, 0, 0, currentCanvas.width, currentCanvas.height);
  } else {
    setSize(currentCanvas.width * scalex, currentCanvas.height * scaley);
  }
}

export function scaleSmooth(scalex = 1, scaley = scalex, maxSteps = 10) {
  if (scalex >= 0.5 && scaley >= 0.5) {
    scaleFast(scalex, scaley, true);
  } else {
    const w = currentCanvas.width, h = currentCanvas.height;
    const cnv = cloneCanvas(currentCanvas);
    const ctx = cnv.getContext("2d") as CanvasRenderingContext2D;
    const steps = Math.min(maxSteps, Math.ceil(Math.log2(1 / Math.min(scalex, scaley))));
    let currentSX = 1, currentSY = 1, lastSX = 1, lastSY = 1;
    for (let step = 0; step < steps; step++) {
      currentSX = Math.max(scalex, currentSX / 2);
      currentSY = Math.max(scaley, currentSY / 2);
      ctx.drawImage(currentCanvas, 0, 0, w, h, 0, 0, w * currentSX / lastSX, h * currentSY / lastSY);
      lastSX = currentSX;
      lastSY = currentSY;
    }
    // Final resize
    setSize(currentCanvas.width * scalex, currentCanvas.height * scaley);
    currentContext.drawImage(cnv, 0, 0, currentCanvas.width, currentCanvas.height);
  }
}

export const scaleSize = scaleSmooth;

export function scaleBelow(width: number, height = width, highQuality = false) {
  const sx = width / currentCanvas.width, sy = height / currentCanvas.height;
  const scale = Math.min(sx, sy);
  if (scale < 1) {
    if (highQuality) {
      scaleSmooth(scale);
    } else {
      scaleFast(scale);
    }
  }
}

export function crop(x: number, y: number, width = currentCanvas.width - x, height = currentCanvas.height - y) {
  const cnv = cloneCanvas(currentCanvas);
  setSize(width, height);
  currentContext.drawImage(cnv, -x, -y);
}

export function gen(generator: Generator, subsamples = 1): void {
  if (subsamples <= 1) {
    filter(((_, x, y) => generator(x, y)) as Filter);
  } else {
    const step = 1 / subsamples;
    const off = -(1 - step) / 2;
    filter((_, x, y) => {
      const colors = [];
      for (let sy = 0; sy < subsamples; sy++) {
        const py = y + off + sy * step;
        for (let sx = 0; sx < subsamples; sx++) {
          colors.push(generator(x + off + sx * step, py));
        }
      }
      return blendManyColors(colors as (number[] | ColorRGB[] | ColorRGBA[]));
    });
  }
}

export function genRel(generator: Generator, subsamples?: number): void {
  const w = currentCanvas.width, h = currentCanvas.height;
  gen(((x, y) => generator(x / w, y / h)) as Generator, subsamples);
}

export function genCentered(generator: Generator, subsamples?: number): void {
  const w = currentCanvas.width, h = currentCanvas.height;
  const cx = (w + 1) / 2, cy = (h + 1) / 2;
  const size = Math.min(cx, cy);
  gen(((x, y) => generator((x - cx) / size, (y - cy) / size)) as Generator, subsamples);
}

export function genRadial(generator: Generator, subsamples?: number): void {
  const w = currentCanvas.width, h = currentCanvas.height;
  const size = Math.max(w, h) / 2;
  const cx = (w + 1) / 2, cy = (h + 1) / 2;
  gen(((x, y) => {
    const dx = x - cx, dy = y - cy;
    const ang = Math.atan2(dx, dy), dis = Math.sqrt(dx * dx + dy * dy) / size;
    return generator(ang, dis);
  }) as Generator, subsamples);
}


export function fill(c: CssColor | number): void {
  currentContext.save();
  currentContext.globalCompositeOperation = "copy";
  currentContext.fillStyle = (c instanceof Array ? c.toRGBA() : (c === +c) ? [c, c, c].toRGBA() : c) as string;
  currentContext.fillRect(-Number.MAX_SAFE_INTEGER / 2, -Number.MAX_SAFE_INTEGER / 2,
      Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);
  currentContext.restore();
}

export function clear(): void {
  fill([0, 0, 0, 0]);
}

export function getHueDiff(a: number, b: number): number {
  const diff = (a - b) % 1;
  return diff > 0.5 ? 1 - diff : diff < -0.5 ? diff + 1 : diff;
}

exposeToWindow({useCanvas, createCanvas, cloneCanvas, getCanvas, getContext, setSize, gen, genCentered,
    genRadial, genRel, fill, clear, getHueDiff, scaleFast, scaleSmooth, scaleSize, scaleBelow, crop,
    clipRect, clipRel, getClipping, animator, animate });