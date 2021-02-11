/* eslint-disable @typescript-eslint/no-explicit-any */
import { WatchCallback } from "vue";

type WatcherType = { immediate: boolean; handler: Function };

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