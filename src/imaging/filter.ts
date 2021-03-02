/* eslint-disable @typescript-eslint/no-use-before-define */

import { clamp, exposeToWindow } from "@/util";
import { ColorRGB, ColorRGBA, currentCanvas, currentContext, getClipping } from "./imageUtil";

export type Filter = ((c: ColorRGBA, x: number, y: number, get: GetColor) => number)
    | ((c: ColorRGBA, x: number, y: number, get: GetColor) => ColorRGB)
    | ((c: ColorRGBA, x: number, y: number, get: GetColor) => ColorRGBA);

export type PixelAnalyzer = ((c: ColorRGBA, x: number, y: number) => void);

export type PixelReducer<T> = ((current: T, c: ColorRGBA) => T);

export type GetColor = (x: number, y: number) => ColorRGBA;
export type GetNumber = (x: number, y: number) => number;

export enum BUFFER_TYPE {
    NONE = "none",
    BUFFER = "buffer"
}

export function getPixelGetter(): GetColor {
    const w = currentCanvas.width, h = currentCanvas.height;
    const dataObj = currentContext.getImageData(0, 0, w, h);
    return prepareBufferOrGetter(dataObj, false);
}

export function getChannelGetters(): [ GetNumber, GetNumber, GetNumber, GetNumber ] {
    const w = currentCanvas.width, h = currentCanvas.height;
    const dataObj = currentContext.getImageData(0, 0, w, h);
    const data = dataObj.data;
    const getters = [0, 1, 2, 3].map(off => (x: number, y: number) => data[4 * (x + w * y) + off]) as [ GetNumber, GetNumber, GetNumber, GetNumber ];
    return getters;
}

export function analyzePixels(analyzer: PixelAnalyzer): void {
    const w = currentCanvas.width, h = currentCanvas.height;
    const dataObj = currentContext.getImageData(0, 0, w, h);
    const data = dataObj.data;
    let p = 0;

    const [clipX, clipY, clipW, clipH] = getClipping();
    const ymax = clipY + clipH, xmax = clipX + clipW;
    const col: ColorRGBA = [0, 0, 0, 0];
    for (let y = clipY; y < ymax; y++) {
        p = 4 * (clipX + w * y);
        for (let x = clipX; x < xmax; x++) {
            col[0] = data[p];
            col[1] = data[p + 1];
            col[2] = data[p + 2];
            col[3] = data[p + 3];
            analyzer(col, x, y);
        }
    }
}

export function reducePixels<T>(reducer: PixelReducer<T>, initial: T): T {
    let result = initial;
    analyzePixels((c) => result = reducer(initial, c));
    return result;
}

export function filter(filterFunc: Filter, buffer = false, interpolate = false, enforceBounds = false): void {
    const w = currentCanvas.width, h = currentCanvas.height;
    const dataObj = currentContext.getImageData(0, 0, w, h);
    const data = dataObj.data;
    let p = 0;

    const pixelGetter = prepareBufferOrGetter(dataObj, buffer, interpolate, enforceBounds);

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

function prepareBufferOrGetter(imageData: ImageData, buffer: boolean, interpolate = false, enforceBounds = false): GetColor {
    const data = imageData.data, w = imageData.width, h = imageData.height, w1 = w - 1, h1 = h - 1;
    const buff = buffer ? data.slice() : data;
    const mode = (interpolate ? 1 : 0) | (enforceBounds ? 2 : 0);
    const rowOffset = 4 * w;
    switch (mode) {
        case 0:
            // No interpolation, no enforced bounds
            return (x, y) => {
                const p = 4 * (x + w * y);
                return [ buff[p], buff[p + 1], buff[p + 2], buff[p + 3] ];
            }
        case 1:
            // Interpolation, no bounds
            return (x, y) => {
                const x1 = Math.floor(x), y1 = Math.floor(y), dx = x - x1, dy = y - y1, dx1 = 1 - dx, dy1 = 1 - dy;
                const pTL = 4 * (x1 + w * y1), pTR = pTL + 4, pBL = pTL + rowOffset, pBR = pBL + 4;
                return [
                    dx * (dy * buff[pBR    ] + dy1 * buff[pTR    ]) + dx1 * (dy * buff[pBL    ] + dy1 * buff[pTL    ]),
                    dx * (dy * buff[pBR + 1] + dy1 * buff[pTR + 1]) + dx1 * (dy * buff[pBL + 1] + dy1 * buff[pTL + 1]),
                    dx * (dy * buff[pBR + 2] + dy1 * buff[pTR + 2]) + dx1 * (dy * buff[pBL + 2] + dy1 * buff[pTL + 2]),
                    dx * (dy * buff[pBR + 3] + dy1 * buff[pTR + 3]) + dx1 * (dy * buff[pBL + 3] + dy1 * buff[pTL + 3]),
                ];
            }
        case 2:
            // No interpolation, enforced bounds
            return (x, y) => {
                const p = 4 * (clamp(x, 0, w) + w * clamp(y, 0, h));
                return [ buff[p], buff[p + 1], buff[p + 2], buff[p + 3] ];
            }
        case 3:
            // Interpolation, enforced bounds
            return (x, y) => {
                const x1 = Math.floor(clamp(x, 0, w1)), y1 = Math.floor(clamp(y, 0, h1)), dx = x - x1, dy = y - y1, dx1 = 1 - dx, dy1 = 1 - dy;
                const pTL = 4 * (x1 + w * y1), pTR = pTL + 4, pBL = pTL + rowOffset, pBR = pBL + 4;
                return [
                    dx * (dy * buff[pBR    ] + dy1 * buff[pTR    ]) + dx1 * (dy * buff[pBL    ] + dy1 * buff[pTL    ]),
                    dx * (dy * buff[pBR + 1] + dy1 * buff[pTR + 1]) + dx1 * (dy * buff[pBL + 1] + dy1 * buff[pTL + 1]),
                    dx * (dy * buff[pBR + 2] + dy1 * buff[pTR + 2]) + dx1 * (dy * buff[pBL + 2] + dy1 * buff[pTL + 2]),
                    dx * (dy * buff[pBR + 3] + dy1 * buff[pTR + 3]) + dx1 * (dy * buff[pBL + 3] + dy1 * buff[pTL + 3]),
                ];
            }
        default:
            // Should never happen
            return (x, y) => [0, 0, 0, 0];
    }
}

exposeToWindow({
    filter,
    getPixelGetter,
    getChannelGetters,
    analyzePixels,
    reducePixels
});