/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { exposeToWindow } from '@/util';
import './ArrayExtension';
import './color';
import './interpolation';
import './ColorGradient';
import './perlin';
import './generator';
import './transform';
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

export type CoordTransform = (x: number, y: number) => [number, number];
export let currentTransform: CoordTransform | null = null;

export function transformCoords(transform: CoordTransform | null) {
  if (currentTransform == null || transform == null) {
    currentTransform = transform;
  } else {
    const prevTransform = currentTransform;
    currentTransform = (x, y) => transform(...prevTransform(x, y));
  }
}


export function getHueDiff(a: number, b: number): number {
  const diff = (a - b) % 1;
  return diff > 0.5 ? 1 - diff : diff < -0.5 ? diff + 1 : diff;
}

exposeToWindow({useCanvas, createCanvas, cloneCanvas, getCanvas, getContext, setSize, getHueDiff, scaleFast, scaleSmooth, scaleSize, scaleBelow, crop,
    clipRect, clipRel, getClipping, animator, animate, transformCoords });