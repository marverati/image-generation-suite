/* eslint-disable @typescript-eslint/no-explicit-any */
import { shallowObjectsDiffer } from "@/util";
import AbstractProjectItem from "./AbstractProjectItem";

export type SnippetParameter = {
  label: string;
  value: any;
  inUse: boolean;
  object: Record<string, any>;
}

export default class Snippet extends AbstractProjectItem {
  private code = "";
  private savedCode = "";
  private dirty = false;

  private params: SnippetParameter[] = [];

  public setCode(code: string): void {
    if (code !== this.code) {
      this.code = code;
      this.dirty = (this.code !== this.savedCode);
    }
  }

  public getCode(): string {
    return this.code;
  }

  public isDirty(): boolean {
    return this.dirty;
  }

  public clearParams(deleteAll = false): void {
    if (deleteAll) {
      this.params = [];
    } else {
      for (const p of this.params) {
        p.inUse = false;
      }
    }
  }

  public getParam(label: string, initialValue: any, properties: Record<string, any>): SnippetParameter {
    let param = this.params.find(p => p.label === label);
    if (!param) {
      param = {
        label,
        value: initialValue,
        object: properties,
        inUse: true
      };
      this.params.push(param);
    } else {
      param.inUse = true;
      // Update parameter properties (e.g. min, max, ...)
      if (shallowObjectsDiffer(param.object, properties)) {
        param.object = properties;
        param.value = initialValue;
      }
    }
    return param;
  }

  public getParams(includingInactive = false): SnippetParameter[] {
    if (includingInactive) {
      return this.params.slice();
    } else {
      return this.params.filter(p => p.inUse);
    }
  }
}