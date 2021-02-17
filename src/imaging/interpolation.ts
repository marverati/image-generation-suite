import { clamp, exposeToWindow } from "@/util";

export type InterpolationFunction = (v: number) => number;
export type FourPointInterpolationFunction = (a: number, b: number, c: number, d: number, v: number) => number;

export enum InterpolationMode {
    LINEAR = "linear",
    COS = "cos",
    CUBIC = "cubic",
    STEP = "step",
    STEP0 = "step0",
    STEP1 = "step1"
}

export enum FourPointInterpolationMode {
    SMOOTH = "smooth",
    SMOOTH_BOUND = "smoothBound"
}

export const Interpolation = {
    linear: (v: number) => v,
    cos: (v: number) => v < 0 ? 0 : v > 1 ? 1 : 0.5 - 0.5 * Math.cos(Math.PI * v),
    cos2: (v: number) => v < 0 ? 0 : v > 1 ? 1 : 0.5 - 0.5 * Math.cos(Math.PI * (0.5 - 0.5 * Math.cos(Math.PI * v))),
    cos3: (v: number) => v < 0 ? 0 : v > 1 ? 1 : 0.5 - 0.5 * Math.cos(Math.PI
            * (0.5 - 0.5 * Math.cos(Math.PI * (0.5 - 0.5 * Math.cos(Math.PI * v))))),
    cubic: (v: number) => v < 0 ? 0 : v > 1 ? 1 : 3 * v * v - 2 * v * v * v,
    step: (v: number) => v > 0.5 ? 1 : 0,
    step0: (v: number) => v > 0 ? 1 : 0,
    step1: (v: number) => v >= 1 ? 1 : 0
}

function getGradientFactor(y: number): number {
    return 0.5 - 0.5 * Math.cos(2 * Math.PI * clamp(y, 0, 1));
}

export const FourPointInterpolation = {
    smooth: (y0: number, y1: number, y2: number, y3: number, v: number): number => {
        const g1 = (y2 - y0) / 2, g2 = (y3 - y1) / 2;
        return y1 + v * g1 + v * v * (3 * y2 - 3 * y1 - 2 * g1 - g2) + v * v * v  * (g2 - 2 * y2 + g1 + 2 * y1);
    },
    // Same as smooth, but gradients are limited
    smoothBound: (y0: number, y1: number, y2: number, y3: number, v: number): number => {
        const g1 = (y2 - y0) / 2 * getGradientFactor(y1), g2 = (y3 - y1) / 2 * getGradientFactor(y2);
        return y1 + v * g1 + v * v * (3 * y2 - 3 * y1 - 2 * g1 - g2) + v * v * v  * (g2 - 2 * y2 + g1 + 2 * y1);
    },
}

exposeToWindow({ Interpolation, ease: Interpolation.cos, FourPointInterpolation });
