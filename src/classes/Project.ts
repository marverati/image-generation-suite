import AbstractProjectItem from "./AbstractProjectItem";
import Folder, { FolderJSON } from "./Folder";
import Snippet from "./Snippet";

export type ProjectJSON = {
  version: number;
  type: "project";
  tree: FolderJSON;
  date: number;
}

export default class Project {
  public readonly root: Folder;

  constructor(root?: Folder) {
    if (root) {
      this.root = root;
    } else {
      // Random test stuff
      this.root = new Folder("workspace", this);
//       const folder = new Folder("Test");
//       const snip1 = new Snippet("Snippet 1");
//       const snip2 = new Snippet("Snippet 2");
//       const snip3 = new Snippet("Inner Snippet");
//       folder.append(snip3);
//       this.root.append(snip1);
//       this.root.append(snip2);
//       this.root.append(folder);
//       snip3.setCode(`setSize(512);
// const red = _param('Red', 0, 0, 255);
// gen((x, y) => x & y)
// filter(c => [red, 255 - c[1], c[2], 255])`)
    }
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  public static fromJSON(json: ProjectJSON): Project {
    if (json.type !== "project") {
      throw new Error("Tried to create project from invalid JSON with type: " + json.type);
    }
    const root = Folder.fromJSON(json.tree, json.version);
    const p = new Project(root);
    return p;
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  public toJSON(): ProjectJSON {
    return {
      version: 1,
      type: "project",
      tree: this.root.toJSON(),
      date: Date.now()
    };
  }

  public getAllSnippets(): Snippet[] {
    return this.getAllTreeItems().filter(item => item instanceof Snippet) as Snippet[];
  }

  public getAllFolders(): Folder[] {
    return this.getAllTreeItems().filter(item => item instanceof Folder) as Folder[];
  }

  public getAllTreeItems(): AbstractProjectItem[] {
    return this.root.getAllDescendants();
  }

}