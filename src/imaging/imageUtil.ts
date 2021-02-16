/* eslint-disable @typescript-eslint/no-use-before-define */

import { exposeToWindow } from '@/util';
import './ArrayExtension';
import './color';
import { blendManyColors } from './color';
import './interpolation';
import './ColorGradient';

declare global {
  interface HTMLCanvasElement {
    use(): void;
  }
}

HTMLCanvasElement.prototype.use = function() {
  useCanvas(this);
  return this;
}

let currentCanvas: HTMLCanvasElement = document.createElement("canvas");
let currentContext: CanvasRenderingContext2D = currentCanvas.getContext("2d") as CanvasRenderingContext2D;

export type ColorRGB = [number, number, number];
export type ColorRGBA = [number, number, number, number];
export type CssColor = ColorRGB | ColorRGBA | number | string; 
export type Filter = ((c: ColorRGBA, x: number, y: number) => number)
    | ((c: ColorRGBA, x: number, y: number) => ColorRGB)
    | ((c: ColorRGBA, x: number, y: number) => ColorRGBA);
export type Generator = ((x: number, y: number) => number) | ((x: number, y: number) => ColorRGB)
    | ((x: number, y: number) => ColorRGBA);

export function useCanvas(canvas: HTMLCanvasElement = (window as any).previewCanvas) {
  currentCanvas = canvas;
  currentContext = canvas.getContext("2d") as CanvasRenderingContext2D;
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

export function getContext(): CanvasRenderingContext2D {
  return currentContext;
}

export function setSize(w = 512, h = w): void {
  currentCanvas.width = Math.round(w);
  currentCanvas.height = Math.round(h);
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

export function scaleBelow(width: number, height = width, highQuality = true) {
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

export async function animate(renderFunc: (dt: number, t: number) => (void | boolean), maxTime = 10000,
    baseSpeed = 1, t0 = 0, minStep = 0): Promise<void> {
  let done = false;
  const cancel = false; // let and expose to caller so they may cancel the thing
  // let cancelFunction = () => {
  //   cancel = true;
  // }

  let now = Date.now(), total = t0;
  const speed = baseSpeed; // use let to be able to vary speed based on UI or pausing
  function runFrame() {
    // Handle timing
    const prev = now;
    const newNow = Date.now();
    // Only update time and render things when minimum time step is surpassed (usually this is always true)
    if (newNow - prev >= minStep) {
      now = newNow;
      const diff = now - prev;
      const dt = speed * diff;
      total += dt;
      // TODO: mouse and keys
    
      // Run provided render code
      done = !!renderFunc(dt, total);
    }
      

    if (total < maxTime && !cancel && !done) {
      requestAnimationFrame(runFrame);
    }
  }

  runFrame();
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
  gen(((x, y) => generator((x - cx) / cx, (y - cy) / cy)) as Generator, subsamples);
}

export function genRadial(generator: Generator, subsamples?: number): void {
  const w = currentCanvas.width, h = currentCanvas.height;
  const size = Math.max(w, h) / 2;
  const cx = (w + 1) / 2, cy = (h + 1) / 2;
  gen(((x, y) => {
    const dx = x - cy, dy = y - cy;
    const ang = Math.atan2(dx, dy), dis = Math.sqrt(dx * dx + dy * dy) / size;
    return generator(ang, dis);
  }) as Generator, subsamples);
}

export function filter(filterFunc: Filter): void {
  const w = currentCanvas.width, h = currentCanvas.height;
  const dataObj = currentContext.getImageData(0, 0, w, h);
  const data = dataObj.data;
  let p = 0;
  const col: ColorRGBA = [0, 0, 0, 0];
  const example = filterFunc(col, 0, 0);
  if (typeof example === "number") {
    const original = filterFunc;
    filterFunc = (col, x, y) => {
      const c = original(col, x, y) as number;
      return [c, c, c, 255];
    }
  }
  const typedFilterFunc = filterFunc as ((c: ColorRGBA, x: number, y: number) => ColorRGBA);
  let result: ColorRGBA = col;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      col[0] = data[p];
      col[1] = data[p + 1];
      col[2] = data[p + 2];
      col[3] = data[p + 3];
      result = typedFilterFunc(col, x, y);
      data[p++] = result[0];
      data[p++] = result[1];
      data[p++] = result[2];
      if (result[3] != null) {
        data[p++] = result[3];
      } else {
        data[p++] = 255;
      }
    }
  }
  currentContext.putImageData(dataObj, 0, 0);
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
    genRadial, genRel, filter, animate, fill, clear, getHueDiff, scaleFast, scaleSmooth, scaleSize, scaleBelow });