import { exposeToWindow } from "@/util";
import { blendManyColors } from './color';
import { Filter, filter } from './filter';
import { ColorRGB, ColorRGBA, CssColor, currentCanvas, currentContext, currentTransform, transformCoords } from "./imageUtil";

export type Generator = ((x: number, y: number) => number) | ((x: number, y: number) => ColorRGB)
    | ((x: number, y: number) => ColorRGBA);

export function gen(generator: Generator, subsamples = 1): void {
    const transform = currentTransform;
    if (subsamples <= 1) {
        if (transform) {
            // Some coord transformation is active
            filter(((_, x, y) => generator(...transform(x, y))) as Filter);
        } else {
            // Default case, no coord transformation applied
            filter(((_, x, y) => generator(x, y)) as Filter);
        }
    } else {
        const step = 1 / subsamples;
        const off = -(1 - step) / 2;
        const tempNums: [number, number] = [0, 0];
        const transformCoords = transform ?? ((x: number, y: number) => { tempNums[0] = x; tempNums[1] = y; return tempNums; });
        const filterFunc = (_: any, x: number, y: number) => {
            const colors = [];
            for (let sy = 0; sy < subsamples; sy++) {
                const py = y + off + sy * step;
                for (let sx = 0; sx < subsamples; sx++) {
                    colors.push(generator(...transformCoords(x + off + sx * step, py)));
                }
            }
            return blendManyColors(colors as (number[] | ColorRGB[] | ColorRGBA[]));
        }
        filter(filterFunc);
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
  
exposeToWindow({gen, genCentered, genRadial, genRel, fill, clear});