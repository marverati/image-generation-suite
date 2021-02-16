import { exposeToWindow } from "@/util";
import { blendColors, colorToRGBA } from "./color";
import ColorMapping, { ColorMappingFunction, ColorMappingOverflow } from "./ColorMapping";
import { ColorRGB, ColorRGBA } from "./imageUtil";

type ColorList = (ColorRGBA | ColorRGB | number)[];

export default class ColorGradient extends ColorMapping {

    public constructor(public readonly colors: ColorList,
            overflow?: ColorMappingOverflow, cacheSteps = colors.length * 256) {
        super(ColorGradient.getColorMapping(colors), overflow, cacheSteps)
    }

    public static getColorMapping(colors: ColorList): ColorMappingFunction {
        const rgbaColors = colors.map(colorToRGBA);
        const max = colors.length - 1;
        return (p: number) => {
            const floatingIndex = p * max, i1 = floatingIndex << 0, i2 = i1 + 1;
            return blendColors(rgbaColors[i1], rgbaColors[i2], floatingIndex - i1);
        };
    }
}

exposeToWindow({ ColorGradient });