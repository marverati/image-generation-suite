/* eslint-disable @typescript-eslint/no-use-before-define */
import { clamp, exposeToWindow } from "@/util";

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

type AnimationStateCallback = (started: boolean, playing: boolean) => boolean;
type AnimationProgressCallback = (progress: number) => boolean;

export default class Animator {

    private animationStarted = false;
    private animationRunning = false;
    private internalStopAnimation = () => { /* noop */ };
    private internalResumeAnimation = () => { /* noop */ };
    private internalSetProgress = (p: number) => { p && 0 };
    private animationUISpeed = 1;
    private animationStateCallbacks: AnimationStateCallback[] = [];
    private animationProgressCallbacks: AnimationProgressCallback[] = [];
    private canvasGetter: () => HTMLCanvasElement;

    public constructor(canvasOrGetter: HTMLCanvasElement | (() => HTMLCanvasElement)) {
        this.canvasGetter = (canvasOrGetter instanceof HTMLCanvasElement) ? () => canvasOrGetter : canvasOrGetter;
    }

    public isAnimating() {
        return this.animationStarted;
    }
    
    public isAnimationPlaying() {
        return this.animationStarted && this.animationRunning;
    }
    
    public setAnimationSpeed(speed = 1) {
        this.animationUISpeed = speed;
    }
    
    public getAnimationSpeed() {
        return this.animationUISpeed;
    }
    
    public stopAnimation() {
        this.animationRunning = false;
        this.animationStarted = false;
        this.internalStopAnimation();
        this.emitAnimationState();
    }
    
    public pauseAnimation() {
        this.animationRunning = false;
        this.emitAnimationState();
    }
    
    public resumeAnimation() {
        if (this.animationStarted) {
            this.animationRunning = true;
            this.internalResumeAnimation();
            this.emitAnimationState();
        }
    }
    
    public setAnimationProgress(p: number) {
        this.internalSetProgress(p);
    }

    public registerAnimationStateListener(callback: AnimationStateCallback): void {
        this.animationStateCallbacks.push(callback);
    }

    public registerAnimationProgressListener(callback: AnimationProgressCallback): void {
        this.animationProgressCallbacks.push(callback);
    }

    private emitAnimationState(): void {
        for (let i = this.animationStateCallbacks.length - 1; i >= 0; i--) {
            const del = this.animationStateCallbacks[i](this.animationStarted, this.animationRunning);
            if (del) {
                this.animationStateCallbacks.splice(i, 1);
            }
        }
    }

    private emitAnimationProgress(p: number): void {
        for (let i = this.animationProgressCallbacks.length - 1; i >= 0; i--) {
            const del = this.animationProgressCallbacks[i](p);
            if (del) {
                this.animationProgressCallbacks.splice(i, 1);
            }
        }
    }

    public animate(renderFunc: (dt: number, t: number, interactionState: InteractionState) => (void | boolean), maxTime = 10000,
            baseSpeed = 1, t0 = 0, minStep = 0, maxStep = 100): Promise<void> {
        let done = false, cancel = false;
        let now: number, total = t0;

        // Stop previous animation if any was running
        const stopThisAnimation = () => {
            removeListeners(cnv);
            this.animationRunning = false;
            this.animationStarted = false;
            this.emitAnimationState();
        }
        this.internalStopAnimation();
        this.internalSetProgress = (p: number) => { total = t0 + p * (maxTime - t0); }
        const returnPromise = new Promise<void>((resolve, reject) => {
            this.internalStopAnimation = () => {
                cancel = true;
                stopThisAnimation();
                this.internalStopAnimation = () => { /* noop */ };
                resolve();
            }
        });
        this.internalResumeAnimation = () => { now = Date.now(); }
        this.animationStarted = true;

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
                stop: this.stopAnimation,
                pause: this.pauseAnimation,
                resume: this.resumeAnimation
            }
        };

        const cnv = this.canvasGetter();
        addListeners(cnv);

        now = Date.now();
        this.animationRunning = true;
        this.emitAnimationState();
        const runFrame = () => {
            // Handle timing
            const prev = now;
            const newNow = Date.now();
            // Only update time and render things when animation is not paused, and when
            // minimum time step is surpassed (usually this is always true)
            if (this.animationRunning && !cancel && newNow - prev >= minStep) {
                now = newNow;
                const diff = now - prev;
                const speed = baseSpeed * this.animationUISpeed;
                const dt = clamp(speed * diff, -maxStep, maxStep);
                total += dt;
                if (dt > 0) {
                    this.emitAnimationProgress((total - t0) / (maxTime - t0));
                }

                // mouse and keys
                updateKeyState(mouseState.left);
                updateKeyState(mouseState.right);

                // Run provided render code
                done = !!renderFunc(dt, total, interactionState);
            }
            
            // Set up next frame, or end animation
            if (total < maxTime && !cancel && !done && this.animationStarted) {
                requestAnimationFrame(runFrame);
            } else {
                // If animation was cancelled, then stopThisAnimation() has been executed already
                if (!cancel) {
                    stopThisAnimation();
                }
            }
        }

        runFrame();

        return returnPromise;

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

}
