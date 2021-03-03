/* eslint-disable @typescript-eslint/no-use-before-define */
import { exposeToWindow } from "@/util";
import { getPreviewCanvas } from "./imageUtil";

type KeyState = {
    pressed: boolean;
    down: boolean;
    up: boolean;
    omitUpdate: boolean;
}

type MouseState = {
    x: number;
    y: number;
    dx: number;
    dy: number;
    xrel: number;
    yrel: number;
    dxrel: number;
    dyrel: number;
    inside: boolean;
    left: KeyState;
    right: KeyState;
}

interface InteractionState {
    mouse: MouseState;
    getKey: (key: string) => KeyState;
}

let animationRunning = false;

export function isAnimating() {
    return animationRunning;
}

export async function animate(renderFunc: (dt: number, t: number, interactionState: InteractionState) => (void | boolean), maxTime = 10000,
        baseSpeed = 1, t0 = 0, minStep = 0): Promise<void> {
    let done = false;
    const cancel = false; // let and expose to caller so they may cancel the thing
    // let cancelFunction = () => {
    //   cancel = true;
    // }

    const keyStates: Record<string, KeyState> = {};
    const mouseState: MouseState = {
        x: 0,
        y: 0,
        dx: 0,
        dy: 0,
        xrel: 0,
        yrel: 0,
        dxrel: 0,
        dyrel: 0,
        inside: false,
        left: { pressed: false, up: false, down: false, omitUpdate: false },
        right: { pressed: false, up: false, down: false, omitUpdate: false }
    };
    const interactionState: InteractionState = {
        getKey: (key: string) => { ensureKeyExistence(key); return keyStates[key]; },
        mouse: mouseState
    };

    const cnv = getPreviewCanvas();
    addListeners(cnv);

    let now = Date.now(), total = t0;
    const speed = baseSpeed; // use let to be able to vary speed based on UI or pausing
    animationRunning = true;
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

            // mouse and keys
            updateKeyState(mouseState.left);
            updateKeyState(mouseState.right);

            // Run provided render code
            done = !!renderFunc(dt, total, interactionState);
        }
        

        if (total < maxTime && !cancel && !done) {
            requestAnimationFrame(runFrame);
        } else {
            removeListeners(cnv);
            animationRunning = false;
        }
    }

    runFrame();

    function addListeners(canvas: HTMLCanvasElement): void {
        canvas.addEventListener("mousedown", handleMouseDown);
        document.body.addEventListener("mousemove", handleMouseMove);
        document.body.addEventListener("mouseup", handleMouseUp);
        canvas.addEventListener("keydown", handleKeyDown);
        canvas.addEventListener("keyup", handleKeyUp);
        canvas.focus();
    }

    function removeListeners(canvas: HTMLCanvasElement): void {
        canvas.removeEventListener("mousedown", handleMouseDown);
        document.body.removeEventListener("mousemove", handleMouseMove);
        document.body.removeEventListener("mouseup", handleMouseUp);
        canvas.removeEventListener("keydown", handleKeyDown);
        canvas.removeEventListener("keyup", handleKeyUp);
        canvas.blur();
    }

    function setKeyState(state: KeyState, pressed: boolean): void {
        state.down = pressed && !state.pressed;
        state.up = !pressed && state.pressed;
        state.pressed = pressed;
        state.omitUpdate = true;
    }

    function updateKeyState(state: KeyState): void {
        if (state.omitUpdate) {
            state.omitUpdate = false;
        } else {
            state.down = false;
            state.up = false;
        }
    }

    function handleMouseDown(e: MouseEvent): void {
        if (!mouseState.inside) {
            if (e.button === 0) {
                setKeyState(mouseState.left, true);
            } else if (e.button === 2) {
                setKeyState(mouseState.right, true);
            }
            e.preventDefault();
            e.stopPropagation();
        }
    }

    function handleMouseUp(e: MouseEvent): void {
        if (!mouseState.inside) {
            if (e.button === 0) {
                setKeyState(mouseState.left, false);
            } else if (e.button === 2) {
                setKeyState(mouseState.right, false);
            }
            e.preventDefault();
            e.stopPropagation();
        }
    }

    function handleMouseMove(e: MouseEvent): void {
        const rect = cnv.getBoundingClientRect();
        const mxAbs = e.clientX - rect.x, myAbs = e.clientY - rect.y;
        const mx = mxAbs * cnv.width / cnv.clientWidth, my = myAbs * cnv.height / cnv.clientHeight;
        mouseState.dx = mx - mouseState.x;
        mouseState.dy = my - mouseState.y;
        mouseState.x = mx;
        mouseState.y = my;
        const xrel = mx / cnv.width, yrel = my / cnv.height;
        mouseState.dxrel = xrel - mouseState.xrel;
        mouseState.dyrel = yrel - mouseState.yrel;
        mouseState.xrel = xrel;
        mouseState.yrel = yrel;
        mouseState.inside = (xrel >= 0 && xrel < 1 && yrel >= 0 && yrel < 1);
    }

    function handleKeyDown(e: KeyboardEvent): void {
        ensureKeyExistence(e.key);
        setKeyState(keyStates[e.key], true);
    }

    function handleKeyUp(e: KeyboardEvent): void {
        ensureKeyExistence(e.key);
        setKeyState(keyStates[e.key], false);
    }

    function ensureKeyExistence(key: string): void {
        if (!keyStates[key]) {
            keyStates[key] = {
                pressed: false,
                down: false,
                up: false,
                omitUpdate: false
            };
        }
    }
}

exposeToWindow({ animate });