
import { exposeToWindow } from '@/util';

let currentCanvas: HTMLCanvasElement = document.createElement("canvas");
let currentContext: CanvasRenderingContext2D = currentCanvas.getContext("2d") as CanvasRenderingContext2D;


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

exposeToWindow({useCanvas, getCanvas, getContext, setSize});