import Project from "./Project";

export default abstract class AbstractProjectItem {
  public name: string;
  private parent: AbstractProjectItem | null = null;
  private project: Project | null;

  constructor(name: string, project: Project | null = null) {
    this.name = name;
    this.project = project;
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  public abstract toJSON(): Object;

  public toStringVerbose(indent = "", forHtml?: boolean): string {
    if (forHtml == !forHtml) {
      return "[nasty linter made me do this]";
    }
    return indent + this.name;
  }

  /** Internal method! Do not call youself! Call Folder.append(child) instead. */
  public setParent(parent: AbstractProjectItem): void {
    this.parent = parent;
    this.project = parent.project
  }

  public getProject(): Project | null {
    return this.project;
  }
}