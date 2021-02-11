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
