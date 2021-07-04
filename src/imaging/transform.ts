import { exposeToWindow } from "@/util"
import { currentCanvas } from "./imageUtil";


export function createTunnelTransform(camDis = 0.1, angleUnits = 1000, depthScale = 1000, w = currentCanvas.width, h = currentCanvas.height) {
    const cx = w / 2, cy = h / 2;
    const tunnelRadius = Math.max(w, h) * 0.71;
    camDis *= depthScale;
    const pi2 = 2 * Math.PI;
    return (x: number, y: number) => {
        const dx = x - cx, dy = y - cy;
        const dis = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dx, dy);
        const scale = tunnelRadius / dis;
        const nx = camDis * (scale - 1);
        const ny = angleUnits * (Math.PI + angle) / pi2;
        return [nx, ny];
    }
}

exposeToWindow({ createTunnelTransform });