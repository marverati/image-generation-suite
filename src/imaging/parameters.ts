/* eslint-disable @typescript-eslint/no-explicit-any */
import ProjectState from "@/components/ProjectState";
import { cleanObject, exposeToWindow } from "@/util";

let project: ProjectState | null = null;

export function useProject(p: ProjectState): void {
  console.log("Using project: ", p);
  project = p;
}

export function getProject(): ProjectState {
  if (!project) {
    throw new Error("No project set");
  }
  return project;
}

export function _getParam(label: string): any {
  const snippet = getProject().getOpenSnippet();
  if (!snippet) {
    return null;
  }
  const object = snippet.findParam(label);
  if (!object) {
    return null;
  }
  return object.value;
}

export function _mapParam(label: string, valueMapper: (oldValue: any) => any) {
  const snippet = getProject().getOpenSnippet();
  if (!snippet) {
    return null;
  }
  const object = snippet.findParam(label);
  if (!object) {
    return null;
  }
  object.value = valueMapper(object.value);
  return object;
}

export function _setParam(label: string, value: any) {
  _mapParam(label, () => value);
}

export function _number(label: string, initialValue: number, minOrMax: number, max?: number, step?: number): number {
  const snippet = getProject().getOpenSnippet();
  if (!snippet) {
    return initialValue;
  }
  let min = minOrMax;
  if (max == null) {
    max = minOrMax;
    min = 0;
  }
  const object = snippet.getParam(label, "range", initialValue, cleanObject({ min, max, step }));
  return object.value;
}

export function _button(label: string, callback: () => void): void {
  const snippet = getProject().getOpenSnippet();
  if (!snippet) {
    return;
  }
  snippet.getParam(label, "action", callback);
}

export function _boolean(label: string, initialValue: boolean): boolean {
  const snippet = getProject().getOpenSnippet();
  if (!snippet) {
    return initialValue;
  }
  const object = snippet.getParam(label, "boolean", initialValue);
  return !!object.value;
}

export function _string(label: string, initialValue: string): string {
  const snippet = getProject().getOpenSnippet();
  if (!snippet) {
    return initialValue;
  }
  const object = snippet.getParam(label, "string", initialValue);
  return object.value;
}

export function _enum(label: string, initialValue: string, values: string[]): string {
  const snippet = getProject().getOpenSnippet();
  if (!snippet) {
    return initialValue;
  }
  const object = snippet.getParam(label, "enum", initialValue, { values });
  return object.value;
}

exposeToWindow({_number, _boolean, _string, _enum, _button, _setParam, _getParam, _mapParam});