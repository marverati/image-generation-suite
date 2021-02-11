import AbstractProjectItem from "./AbstractProjectItem";

export default class Folder extends AbstractProjectItem {
  public readonly children: AbstractProjectItem[] = [];

  public append(child: AbstractProjectItem, preventSorting = false) {
    this.children.push(child);
    child.setParent(this);
    if (!preventSorting) {
      this.sort();
    }
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  public toJSON(): Object {
    return {
      name: this.name,
      type: "folder",
      children:  this.children.map(child => child.toJSON())
    };
  }

  /** Sort folder content alphabetically, and folders to top */
  public sort(): void {
    this.children.sort(Folder.compareItems);
  }

  public static compareItems(i1: AbstractProjectItem, i2: AbstractProjectItem): number {
    // One file and one folder -> folder wins
    if (i1 instanceof Folder !== i2 instanceof Folder) {
      return i1 instanceof Folder ? -1 : 1;
    }
    // Same type -> only compare name
    return i1.name > i2.name ? 1 : -1;
  }

  public toStringVerbose(indent = "", forHtml = false): string {
    const separator = forHtml ? "<br>" : "\n"; 
    const childIndent = indent + (forHtml ? "&nbsp;&nbsp;&nbsp;&nbsp;" : "    ");
    return indent + this.name + this.children.map(c => separator + c.toStringVerbose(childIndent, forHtml)).join('');
  }

  public getAllDescendants(result: AbstractProjectItem[] = []): AbstractProjectItem[] {
    for (const c of this.children) {
      result.push(c);
      if (c instanceof Folder) {
        c.getAllDescendants(result);
      }
    }
    return result;
  }
}