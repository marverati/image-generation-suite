import { exposeToWindow } from "@/util";
import { blendColors, colorToRGBA, getSpectrumColor } from "./color";
import ColorMapping, { ColorMappingFunction, ColorMappingOverflow } from "./ColorMapping";
import { ColorRGB, ColorRGBA } from "./imageUtil";
import { Interpolation, InterpolationMode } from "./interpolation";

type Color = number | ColorRGB | ColorRGBA;
type ColorList = Color[];
type ColorsObject = Record<number, Color>;

export default class ColorGradient extends ColorMapping {

    public constructor(public readonly colors: ColorList, interpolation: InterpolationMode = InterpolationMode.LINEAR,
            overflow?: ColorMappingOverflow, cacheSteps = colors.length * 256) {
        super(ColorGradient.getColorMapping(colors, interpolation), overflow, cacheSteps)
    }

    public static getColorMapping(colors: ColorList | ColorsObject, interpolation: InterpolationMode): ColorMappingFunction {
        const interpolator = Interpolation[interpolation];
        if (colors instanceof Array) {
            // Uniform list of colors
            const rgbaColors = colors.map(colorToRGBA);
            const max = colors.length - 1;
            return (p: number) => {
                const floatingIndex = p * max, i1 = floatingIndex << 0, i2 = i1 + 1;
                return blendColors(rgbaColors[i1], rgbaColors[i2], interpolator(floatingIndex - i1));
            };
        } else {
            // Object with float element of [0, 1] as keys, Color as value
            const keys = Object.keys(colors).map(v => +v).filter(v => v >= 0 && v <= 1).sort((a, b) => a - b);
            const rgbaColors = keys.map(key => colorToRGBA(colors[key]));
            // store prevIndex to optimize search
            let prevL = 0, prevR = 1, prevValue = keys[0], prevSpan = keys[1] - keys[0];
            return (p: number) => {
                if (keys[prevR] < p || keys[prevL] > p) {
                    // New search required
                    prevR = Math.max(1, keys.findIndex(v => v >= p));
                    prevL = prevR - 1;
                    prevValue = keys[prevL];
                    prevSpan = keys[prevR] - prevValue;
                }
                return blendColors(rgbaColors[prevL], rgbaColors[prevR], interpolator((p - prevValue) / prevSpan));
            };
        }
    }

    public static readonly rainbow = new ColorGradient([
        [128,0,255],
        [0,0,255],
        [0,255,255],
        [0,255,0],
        [255,255,0],
        [255,0,0],
        [128,0,255]
    ]);

    public static readonly rainbow2 = new ColorMapping((p) => getSpectrumColor(p, 1));

    public static readonly grayscale = new ColorGradient([0, 255]);

    public static readonly redscale = new ColorGradient([0, [255, 0, 0], [255 ,255, 0], 255]);

    public static readonly bluescale = new ColorGradient([0, [0, 0, 255], [0, 255, 255], 255]);

    public static readonly greenscale = new ColorGradient([0, [0, 128, 0], [128, 255, 128], 255]);
}

exposeToWindow({ ColorGradient });