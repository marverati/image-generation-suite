/* eslint-disable @typescript-eslint/no-explicit-any */
import ProjectState from "@/components/ProjectState";
import { exposeToWindow } from "@/util";

let project: ProjectState | null = null;

export function useProject(p: ProjectState): void {
  project = p;
}

export function getProject(): ProjectState {
  if (!project) {
    throw new Error("No project set");
  }
  return project;
}

export function _param(label: string, initialValue: number, minOrMax: number, max?: number): number {
  const snippet = getProject().getOpenSnippet();
  if (!snippet) {
    return initialValue;
  }
  let min = minOrMax;
  if (max == null) {
    max = minOrMax;
    min = 0;
  }
  const object = snippet.getParam(label, initialValue, { min, max });
  return object.value;
}

export function _checkbox(label: string, initialValue: boolean): boolean {
  return initialValue; // TODO implement
}

export function _enum(label: string, initialValue: string, values: string[]): string {
  return values ? initialValue : ""; // TODO implement 
}

exposeToWindow({_param, _checkbox, _enum});