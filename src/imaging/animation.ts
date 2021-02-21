/* eslint-disable @typescript-eslint/no-use-before-define */
import { exposeToWindow } from "@/util";
import { getPreviewCanvas } from "./imageUtil";

export async function animate(renderFunc: (dt: number, t: number) => (void | boolean), maxTime = 10000,
        baseSpeed = 1, t0 = 0, minStep = 0): Promise<void> {
    let done = false;
    const cancel = false; // let and expose to caller so they may cancel the thing
    // let cancelFunction = () => {
    //   cancel = true;
    // }

    const cnv = getPreviewCanvas();
    addListeners(cnv);

    let now = Date.now(), total = t0;
    const speed = baseSpeed; // use let to be able to vary speed based on UI or pausing
    function runFrame() {
        // Handle timing
        const prev = now;
        const newNow = Date.now();
        // Only update time and render things when minimum time step is surpassed (usually this is always true)
        if (newNow - prev >= minStep) {
            now = newNow;
            const diff = now - prev;
            const dt = speed * diff;
            total += dt;
            // TODO: mouse and keys

            // Run provided render code
            done = !!renderFunc(dt, total);
        }
        

        if (total < maxTime && !cancel && !done) {
            requestAnimationFrame(runFrame);
        } else {
            removeListeners(cnv);
        }
    }

    runFrame();

    function addListeners(canvas: HTMLCanvasElement): void {
        canvas.addEventListener("mousemove", handleMouseMove);
        canvas.addEventListener("mousedown", handleMouseDown);
        canvas.addEventListener("mouseup", handleMouseUp);
    }

    function removeListeners(canvas: HTMLCanvasElement): void {
        canvas.removeEventListener("mousemove", handleMouseMove);
        canvas.removeEventListener("mousedown", handleMouseDown);
        canvas.removeEventListener("mouseup", handleMouseUp);
    }

    function handleMouseDown(e: MouseEvent): void {
        // TODO
    }

    function handleMouseUp(e: MouseEvent): void {
        // TODO
    }

    function handleMouseMove(e: MouseEvent): void {
        // TODO
    }
}

exposeToWindow({ animate });