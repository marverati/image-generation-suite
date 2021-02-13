import { absPow, exposeToWindow, rnd } from "@/util";
import { ColorRGBA } from "./imageUtil";

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

exposeToWindow({ rndColor, rndBrightColor, getSpectrumColor });