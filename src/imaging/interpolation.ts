import { exposeToWindow } from "@/util";

export enum InterpolationMode {
    LINEAR = "linear",
    COS = "cos",
    CUBIC = "cubic",
    STEP = "step",
    STEP0 = "step0",
    STEP1 = "step1"
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

exposeToWindow({ Interpolation, ease: Interpolation.cos });
