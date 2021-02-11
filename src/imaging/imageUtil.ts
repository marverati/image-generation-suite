/* eslint-disable @typescript-eslint/no-use-before-define */

import { exposeToWindow } from '@/util';
import './ArrayExtension';

let currentCanvas: HTMLCanvasElement = document.createElement("canvas");
let currentContext: CanvasRenderingContext2D = currentCanvas.getContext("2d") as CanvasRenderingContext2D;

export type ColorRGB = [number, number, number];
export type ColorRGBA = [number, number, number, number];
export type Color = ColorRGB | ColorRGBA | number;
export type CssColor = Color | string; 
export type Filter = (c: Color, x: number, y: number) => Color;
export type Generator = (x: number, y: number) => Color;

export function useCanvas(canvas: HTMLCanvasElement) {
  currentCanvas = canvas;
  currentContext = canvas.getContext("2d") as CanvasRenderingContext2D;
} 

export function getCanvas(): HTMLCanvasElement {
  return currentCanvas;
}

export function getContext(): CanvasRenderingContext2D {
  return currentContext;
}

export function setSize(w = 512, h = w): void {
  currentCanvas.width = w;
  currentCanvas.height = h;
  currentCanvas.dispatchEvent(new Event("resize"));
}

export function gen(generator: Generator): void {
  filter((_, x, y) => generator(x, y));
}

export function filter(filterFunc: Filter): void {
  const w = currentCanvas.width, h = currentCanvas.height;
  const dataObj = currentContext.getImageData(0, 0, w, h);
  const data = dataObj.data;
  let p = 0;
  const col: Color = [0, 0, 0, 0];
  const example = filterFunc(col, 0, 0);
  if (typeof example === "number") {
    const original = filterFunc;
    filterFunc = (col, x, y) => {
      const c = original(col, x, y) as number;
      return [c, c, c, 255];
    }
  }
  const typedFilterFunc = filterFunc as ((c: Color, x: number, y: number) => ColorRGB | ColorRGBA);
  let result: Color = col;
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
      }
    }
  }
  currentContext.putImageData(dataObj, 0, 0);
}

export function fill(c: CssColor | number): void {
  currentContext.fillStyle = (c instanceof Array ? c.toRGBA() : (c === +c) ? [c, c, c].toRGBA() : c) as string;
  currentContext.fillRect(0, 0, Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);
}

export function clear(): void {
  fill([0, 0, 0, 0]);
}

exposeToWindow({useCanvas, getCanvas, getContext, setSize, gen, filter, fill, clear });