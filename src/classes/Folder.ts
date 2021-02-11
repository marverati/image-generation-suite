/* eslint-disable @typescript-eslint/no-explicit-any */
import AbstractProjectItem from "./AbstractProjectItem";
import Snippet, { SnippetJSON } from "./Snippet";

export type FolderJSON = {
  name: string;
  type: "folder";
  children: (FolderJSON | SnippetJSON)[];
}

export default class Folder extends AbstractProjectItem {
  public readonly children: AbstractProjectItem[] = [];

  public append(child: AbstractProjectItem, preventSorting = false) {
    this.children.push(child);
    child.setParent(this);
    if (!preventSorting) {
      this.sort();
    }
  }

  public toJSON(): FolderJSON {
    return {
      name: this.name,
      type: "folder",
      children:  this.children.map(child => child.toJSON())
    };
  }

  public static fromJSON(json: FolderJSON, version = 0): Folder {
    if (json.type !== "folder") {
      throw new Error("Tried to create folder from invalid JSON of type: " + json.type + " and name: " + json.name);
    }
    const folder = new Folder(json.name);
    for (const c of json.children) {
      if (c.type === "folder") {
        folder.append(Folder.fromJSON(c, version));
      } else if (c.type === "code") {
        folder.append(Snippet.fromJSON(c, version));
      } else {
        throw new Error("Tried to append invalid element to folder, of type: " + (c as any).type
            + " and name: " + (c as any).name);
      }
    }
    return folder;
  }

  public hasChild(name: string, caseSensitive = false): boolean {
    if (!caseSensitive) { name = name.toLowerCase(); }
    const nameIsEqual = caseSensitive
        ? (a: string) => a === name
        : (a: string) => a.toLowerCase() === name;
    return this.children.some(c => nameIsEqual(c.name));
    return false;
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

  public getPath(): string {
    return (this.parent ? this.parent.getPath() + " > " : "") + this.name;
  }
}