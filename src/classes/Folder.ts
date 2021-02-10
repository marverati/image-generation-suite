import AbstractProjectItem from "./AbstractProjectItem";

export default class Folder extends AbstractProjectItem {
  public readonly children: AbstractProjectItem[] = [];

  constructor(name: string) {
    super(name);
  }

  public append(child: AbstractProjectItem, preventSorting = false) {
    this.children.push(child);
    if (!preventSorting) {
      this.sort();
    }
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
}