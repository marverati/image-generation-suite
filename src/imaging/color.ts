import { absPow, exposeToWindow, rnd } from "@/util";
import { ColorRGB, ColorRGBA } from "./imageUtil";

export function rndColor(randomizeAlpha = false): ColorRGBA {
    return [ rnd(255), rnd(255), rnd(255), randomizeAlpha ? rnd(255) : 255 ];
}

export function getSpectrumColor(v: number, power = 1): ColorRGBA {
    power = 1 / power;
    v *= 2 * Math.PI;
    const third = 2 * Math.PI / 3;
    return [
        127.5 + 127.5 * absPow(Math.sin(v), power),
        127.5 + 127.5 * absPow(Math.sin(v + third), power),
        127.5 + 127.5 * absPow(Math.sin(v + third * 2), power),
        255
    ];
}

function rndBrightColor(power = 1, randomizeAlpha = false): ColorRGBA {
    const color = getSpectrumColor(rnd(), power);
    if (randomizeAlpha) {
        color[3] = rnd(255);
    }
    return color;
}

export function blendColors(c1: ColorRGBA, c2: ColorRGBA, f = 0.5): ColorRGBA {
    if (f === 0 || f === 1) {
        return f === 0 ? c1 : c2;
    }
    const a1 = (1 - f) * c1[3], a2 = f * c2[3];
    const alphaSum = a1 + a2;
    return [
        255 * (a1 * c1[0] + a2 * c2[0]) / alphaSum,
        255 * (a1 * c1[1] + a2 * c2[1]) / alphaSum,
        255 * (a1 * c1[2] + a2 * c2[2]) / alphaSum,
        alphaSum / 2
    ];
}

export function blendManyColors(colors: ColorRGBA[] | ColorRGB[] | number[]): ColorRGBA {
    if (colors[0] instanceof Array) {
        // RGB or RGBA
        if (colors[0][3] != null) {
            // RGBA
            const result = [0, 0, 0, 0];
            let alpha = 0;
            for (const color of colors as ColorRGBA[]) {
                alpha = color[3] / 255;
                result[0] += alpha * color[0];
                result[1] += alpha * color[1];
                result[2] += alpha * color[2];
                result[3] += color[3];
            }
            return [
                255 * result[0] / result[3],
                255 * result[1] / result[3],
                255 * result[2] / result[3],
                result[3] / colors.length
            ];
        } else {
            // RGB
            const result = [0, 0, 0];
            for (const color of colors as ColorRGB[]) {
                result[0] += color[0];
                result[1] += color[1];
                result[2] += color[2];
            }
            return [
                result[0] / colors.length,
                result[1] / colors.length,
                result[2] / colors.length,
                255
            ];
        }
    } else {
        // numbers
        const result =  (colors as number[]).reduce((a, b) => a + b, 0) / colors.length;
        return [ result, result, result, 255 ];
    }
}

exposeToWindow({ rndColor, rndBrightColor, getSpectrumColor, blendColors, blendManyColors });