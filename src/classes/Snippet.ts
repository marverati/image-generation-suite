import AbstractProjectItem from "./AbstractProjectItem";

export default class Snippet extends AbstractProjectItem {
  private code = "";
  private savedCode = "";
  private dirty = false;

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
}