/* eslint-disable @typescript-eslint/no-explicit-any */
import { shallowObjectsDiffer } from "@/util";
import AbstractProjectItem from "./AbstractProjectItem";

export type SnippetParameter = {
  label: string;
  type: string;
  value: any;
  inUse: boolean;
  object: Record<string, any>;
}

type Listener = {
  method: Function;
  // eslint-disable-next-line @typescript-eslint/ban-types
  context: Object | null;
};

export default class Snippet extends AbstractProjectItem {
  private code = "";
  private savedCode = "";
  private dirty = false;

  private params: SnippetParameter[] = [];
  private paramListeners: Listener[] = [];

  // eslint-disable-next-line @typescript-eslint/ban-types
  public toJSON(): Object {
    return {
      name: this.name,
      type: "code",
      code: this.savedCode
    };
  }

  public setCode(code: string): void {
    if (code !== this.code) {
      this.code = code;
      this.dirty = (this.code !== this.savedCode);
    }
  }

  public save(): void {
    this.savedCode = this.code;
    this.dirty = false;
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
    this.informParamListeners();
  }

  public getParam(label: string, type: string, initialValue: any, properties: Record<string, any>): SnippetParameter {
    let param = this.params.find(p => p.label === label);
    if (!param) {
      param = {
        label,
        type,
        value: initialValue,
        object: properties,
        inUse: true
      };
      this.params.push(param);
      this.informParamListeners();
    } else {
      const wasInUse = param.inUse;
      param.inUse = true;
      // Update parameter properties (e.g. min, max, ...)
      if (shallowObjectsDiffer(param.object, properties)) {
        param.object = properties;
        param.value = initialValue;
        this.informParamListeners();
      } else if (!wasInUse) {
        this.informParamListeners();
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

  private informParamListeners(): void {
    console.log("informing listeners of ", this.params.length);
    this.paramListeners.forEach(l => l.method.call(l.context));
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  public subscribeToParameterChanges(method: Function, context: Object | null = null): boolean {
    if (!this.paramListeners.find(p => p.method === method && p.context === context)) {
      this.paramListeners.push({
        method,
        context
      });
      return true;
    }
    return false;
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  public ubsubscribeFromParameterChanges(method: Function, context: Object | null = null): boolean {
    const i = this.paramListeners.findIndex(p => p.method === method && p.context === context);
    if (i >= 0) {
      this.paramListeners.splice(i, 1);
      return true;
    }
    return false;
  }
}