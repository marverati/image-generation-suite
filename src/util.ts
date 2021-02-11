import { WatchCallback } from "vue";

type WatcherType = { immediate: boolean; handler: Function };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function initial(callback: WatchCallback<any, any>): { immediate: boolean; handler: WatchCallback<any, any> } {
  return {
    handler: callback,
    immediate: true
  };
}