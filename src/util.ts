/* eslint-disable @typescript-eslint/no-explicit-any */
import { WatchCallback } from "vue";
import seedrandom from 'seedrandom';

export function rnd(minOrMax = 1, max?: number): number {
  if (max == null) {
    return Math.random() * minOrMax;
  } else {
    return minOrMax + Math.random() * (max - minOrMax);
  }
}

export function clamp(v: number, min: number, max: number): number {
  return v < min ? min : v > max ? max : v;
}

export function absPow(v: number, exp = 1): number {
  return (v < 0) ? -((-v) ** exp) : v ** exp;
}

export function absMod(v: number, mod: number): number {
  return v < 0 ? (v % mod) + mod : v % mod;
}

export function initial(callback: WatchCallback<any, any>): { immediate: boolean; handler: WatchCallback<any, any> } {
  return {
    handler: callback,
    immediate: true
  };
}

export function exposeToWindow(obj: Record<string, any>): void {
  for (const key of Object.keys(obj)) {
    (window as any)[key] = obj[key];
  }
}

export function shallowObjectsDiffer(a: Record<string, any>, b: Record<string, any>): boolean {
  const keys1 = Object.keys(a), keys2 = Object.keys(b);
  if (keys1.length !== keys2.length) {
    return true;
  }
  for (const key of keys1) {
    if (a[key] !== b[key]) {
      return true;
    }
  }
  return false;
}

export function cleanObject<T extends Record<string, any>>(obj: T): T {
  for (const key of Object.keys(obj)) {
    if (obj[key] == null) {
      delete obj[key];
    }
  }
  return obj;
}

export function downloadText(filename: string, text: string) {
  const element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

function wobble(t: number, speedFactor = 1, offset = 0, power = 1) {
  t = t * speedFactor * 0.001 + offset;
  let v = (Math.sin(t) + Math.sin(t * 0.7934) + Math.sin(t * 0.31532) + Math.sin(t*0.23543)) * 0.25;
  if (power != 1) {
    v = absPow(v, power);
  }
  return v;
}

export function range(startOrEnd: number, end?: number, step = (end != null && end < startOrEnd) ? -1 : 1): number[] {
  const start = end != null ? startOrEnd : 0;
  if (step === 0) {
    return [ start ];
  }
  const result = [];
  end = end != null ? end : startOrEnd;
  if (step > 0) {
    for (let i = start; i < end; i += step) { result.push(i); }
  } else {
    for (let i = start; i > end; i += step) { result.push(i); }
  }
  return result;
}

export function mapRange(v: number, fromMin: number, fromMax: number, toMin: number, toMax: number): number {
  return toMin + (v - fromMin) * (toMax - toMin) / (fromMax - fromMin); 
}

export function getRangeMapping(fromMin: number, fromMax: number, toMin: number, toMax: number): (v: number) => number {
  const scale = (toMax - toMin) / (fromMax - fromMin);
  return (v: number) => toMin + (v - fromMin) * scale;
}

exposeToWindow({ rnd, absPow, wobble, mapRange, getRangeMapping, range, clamp, seedrandom });
