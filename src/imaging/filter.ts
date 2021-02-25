import { exposeToWindow } from "@/util";
import { ColorRGB, ColorRGBA, currentCanvas, currentContext, getClipping } from "./imageUtil";

export type Filter = ((c: ColorRGBA, x: number, y: number) => number)
    | ((c: ColorRGBA, x: number, y: number) => ColorRGB)
    | ((c: ColorRGBA, x: number, y: number) => ColorRGBA);

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
    const [clipX, clipY, clipW, clipH] = getClipping();
    const ymax = clipY + clipH, xmax = clipX + clipW;
    for (let y = clipY; y < ymax; y++) {
      p = 4 * (clipX + w * y);
      for (let x = clipX; x < xmax; x++) {
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

exposeToWindow({
    filter
});