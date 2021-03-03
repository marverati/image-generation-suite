/* eslint-disable @typescript-eslint/no-use-before-define */
import { clamp, exposeToWindow } from "@/util";
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

type AnimationInterface = {
    pause: () => void;
    resume: () => void;
    stop: () => void;
}

interface InteractionState {
    mouse: MouseState;
    getKey: (key: string) => KeyState;
    animation: AnimationInterface;
}

let animationStarted = false;
let animationRunning = false;
let internalStopAnimation = () => { /* noop */ };
let internalResumeAnimation = () => { /* noop */ };

export function isAnimating() {
    return animationStarted;
}

export function isAnimationPlaying() {
    return animationStarted && animationRunning;
}

export function stopAnimation() {
    animationRunning = false;
    animationStarted = false;
    internalStopAnimation();
}

export function pauseAnimation() {
    animationRunning = false;
}

export function resumeAnimation() {
    if (animationStarted) {
        animationRunning = true;
        internalResumeAnimation();
    }
}

export async function animate(renderFunc: (dt: number, t: number, interactionState: InteractionState) => (void | boolean), maxTime = 10000,
        baseSpeed = 1, t0 = 0, minStep = 0, maxStep = 100): Promise<void> {
    let done = false, cancel = false;
    let now: number, total = t0;

    // Stop previous animation if any was running
    internalStopAnimation();
    internalStopAnimation = () => { cancel = true; internalStopAnimation = () => { /* noop */ }; }
    internalResumeAnimation = () => { now = Date.now(); }
    animationStarted = true;

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
        mouse: mouseState,
        animation: {
            stop: stopAnimation,
            pause: pauseAnimation,
            resume: resumeAnimation
        }
    };

    const cnv = getPreviewCanvas();
    addListeners(cnv);

    now = Date.now();
    const speed = baseSpeed; // use let to be able to vary speed based on UI or pausing
    animationRunning = true;
    function runFrame() {
        // Handle timing
        const prev = now;
        const newNow = Date.now();
        // Only update time and render things when animation is not paused, and when
        // minimum time step is surpassed (usually this is always true)
        if (animationRunning && !cancel && newNow - prev >= minStep) {
            now = newNow;
            const diff = now - prev;
            const dt = clamp(speed * diff, -maxStep, maxStep);
            total += dt;

            // mouse and keys
            updateKeyState(mouseState.left);
            updateKeyState(mouseState.right);

            // Run provided render code
            done = !!renderFunc(dt, total, interactionState);
        }
        
        // Set up next frame, or end animation
        if (total < maxTime && !cancel && !done && animationStarted) {
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

exposeToWindow({ animate, stopAnimation, pauseAnimation, resumeAnimation, isAnimating, isAnimationPlaying });