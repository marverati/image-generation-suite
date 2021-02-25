/* eslint-disable @typescript-eslint/no-use-before-define */

import { exposeToWindow } from "@/util";
import { ColorRGB, ColorRGBA, currentCanvas, currentContext, getClipping } from "./imageUtil";

export type Filter = ((c: ColorRGBA, x: number, y: number, get: GetColor) => number)
    | ((c: ColorRGBA, x: number, y: number, get: GetColor) => ColorRGB)
    | ((c: ColorRGBA, x: number, y: number, get: GetColor) => ColorRGBA);

export type GetColor = (x: number, y: number) => ColorRGBA;

export enum BUFFER_TYPE {
    NONE = "none",
    BUFFER = "buffer"
}

export function filter(filterFunc: Filter, buffer = false): void {
    const w = currentCanvas.width, h = currentCanvas.height;
    const dataObj = currentContext.getImageData(0, 0, w, h);
    const data = dataObj.data;
    let p = 0;

    const pixelGetter = prepareBufferOrGetter(buffer ? BUFFER_TYPE.BUFFER : BUFFER_TYPE.NONE, dataObj);

    const col: ColorRGBA = [0, 0, 0, 0];
    const example = filterFunc(col, 0, 0, () => [0,0,0,255]);
    if (typeof example === "number") {
      const original = filterFunc;
      filterFunc = (col, x, y) => {
        const c = original(col, x, y, pixelGetter) as number;
        return [c, c, c, 255];
      }
    }
    const typedFilterFunc = filterFunc as ((c: ColorRGBA, x: number, y: number, get: GetColor) => ColorRGBA);

    let result: ColorRGBA = col;
    const [clipX, clipY, clipW, clipH] = getClipping();
    const ymax = clipY + clipH, xmax = clipX + clipW;
    for (let y = clipY; y < ymax; y++) {
      p = 4 * (clipX + w * y);
      for (let x = clipX; x < xmax; x++) {
        col[0] = data[p];
        col[1] = data[p + 1];
        col[2] = data[p + 2];
        col[3] = data[p + 3];
        result = typedFilterFunc(col, x, y, pixelGetter);
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

function prepareBufferOrGetter(buffer: BUFFER_TYPE, imageData: ImageData): GetColor {
    const data = imageData.data, w = imageData.width;
    switch (buffer) {
        case BUFFER_TYPE.NONE:
            // No buffering -> just get pixel
            return (x: number, y: number) => {
                const p = 4 * (x + w * y);
                return [ data[p], data[p + 1], data[p + 2], data[p + 3] ];
            }
        case BUFFER_TYPE.BUFFER:
            // Simple buffering -> store whole image data
            {
                const buff = data.slice();
                return (x: number, y: number) => {
                    const p = 4 * (x + w * y);
                    return [ buff[p], buff[p + 1], buff[p + 2], buff[p + 3] ];
                }
            }
    }
}

exposeToWindow({
    filter
});