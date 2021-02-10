
export default abstract class AbstractProjectItem {
  public name: string;

  constructor(name: string) {
    this.name = name;
  }

  public toStringVerbose(indent = "", forHtml?: boolean): string {
    if (forHtml == !forHtml) {
      return "[nasty linter made me do this]";
    }
    return indent + this.name;
  }
}