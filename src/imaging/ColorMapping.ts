import { absMod, clamp, exposeToWindow } from "@/util";
import { ColorRGBA } from "./imageUtil";

export type ColorMappingFunction = (p: number) => ColorRGBA;

const DEFAULT_CACHED_STEPS = 1024;

export enum ColorMappingOverflow {
    CLAMP = "clamp",
    REPEAT = "repeat",
    MIRROR = "mirror",
    HIDDEN = "hidden",
    HIDE = "hide",
    CLAMPDOWN = "clampdown",
    CLAMPUP = "clamup"
} 

export default class ColorMapping {
    public readonly get: ColorMappingFunction;

    public constructor(public readonly mapping: ColorMappingFunction, public readonly overflowMode = ColorMappingOverflow.CLAMP,
            public readonly cacheSteps: number | null = DEFAULT_CACHED_STEPS) {
        this.get = ColorMapping.wrapMappingFunction(mapping, overflowMode, cacheSteps ?? Infinity);
    }

    public static wrapMappingFunction(mapping: ColorMappingFunction, overflowMode: ColorMappingOverflow,
            cacheSteps: number): ColorMappingFunction {
        if (cacheSteps > 0 && cacheSteps < Infinity) {
            mapping = ColorMapping.cacheMapping(mapping, cacheSteps); 
        }
        switch (overflowMode) {
            case ColorMappingOverflow.CLAMP:
                return (p: number) => mapping(clamp(p, 0, 1));
            case ColorMappingOverflow.CLAMPDOWN:
                return (p: number) => p < 0 || p > 1 ? mapping(0) : mapping(p);
            case ColorMappingOverflow.CLAMPUP:
                return (p: number) => p < 0 || p > 1 ? mapping(1) : mapping(p);
            case ColorMappingOverflow.REPEAT:
                return (p: number) => mapping(absMod(p, 1));
            case ColorMappingOverflow.MIRROR:
                return (p: number) => { p = absMod(p, 2); return mapping(p > 1 ? 2 - p : p); };
            case ColorMappingOverflow.HIDDEN:
            case ColorMappingOverflow.HIDE:
                return (p: number) => p < 0 || p > 1 ? [0, 0, 0, 0] : mapping(p);
        }
        return mapping;
    }

    public static cacheMapping(mapping: ColorMappingFunction, steps: number): ColorMappingFunction {
        const c: ColorRGBA[] = [];
        const max = steps - 1;
        for (let i = 0; i <= max; i++) {
            c[i] = mapping(i / max);
        }
        const upperBound = steps - 0.0000001;
        return (p: number) => c[(p * upperBound) << 0];
    }
}

exposeToWindow({ ColorMapping });