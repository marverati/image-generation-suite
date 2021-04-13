/* eslint-disable @typescript-eslint/no-explicit-any */
import { shallowObjectsDiffer } from "@/util";
import AbstractProjectItem from "./AbstractProjectItem";

export type ParamType = "range" | "number" | "boolean" | "string" | "enum" | "action";

export type SnippetParameter = {
  label: string;
  type: ParamType;
  value: any;
  inUse: boolean;
  data: Record<string, any>;
}

export type SnippetJSON = {
  name: string;
  type: "code";
  code: string;
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
  public toJSON(): SnippetJSON {
    return {
      name: this.name,
      type: "code",
      code: this.savedCode
    };
  }

  public static fromJSON(json: SnippetJSON, version = 0): Snippet {
    if (json.type !== "code") {
      throw new Error("Tried to create Code Snippet of invalid type: " + json.type + " and name: " + json.name);
    }
    if (version < 0) {
      throw new Error("Invalid version: " + version);
    }
    const s = new Snippet(json.name)
    s.setCode(json.code);
    s.savedCode = s.code;
    s.dirty = false;
    return s;
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

  public findParam(label: string): SnippetParameter | null {
    return this.params.find(p => p.label === label) ?? null;
  }

  public getParam(label: string, type: ParamType, initialValue: any, properties: Record<string, any> = {}): SnippetParameter {
    let param = this.findParam(label);
    if (!param) {
      param = {
        label,
        type,
        value: initialValue,
        data: properties,
        inUse: true
      };
      this.params.push(param);
      this.informParamListeners();
    } else {
      const wasInUse = param.inUse;
      param.inUse = true;
      // Update parameter properties (e.g. min, max, ...)
      // TODO use better not quite so shallow check, to support enum values array
      if (shallowObjectsDiffer(param.data, properties)) {
        param.data = properties;
        // TODO enable after objectsDiffer check is better
        // param.value = initialValue;
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