import AbstractProjectItem from "./AbstractProjectItem";
import Folder, { FolderJSON } from "./Folder";
import Snippet from "./Snippet";

export type ProjectJSON = {
  version: number;
  type: "project";
  tree: FolderJSON;
  date: number;
}

/**
 * A project is basically an IGS workspace. One user will usually have one such project (although more would be imaginable in the future).
 * The project contains a tree of folders and snippets, accessed via the root folder.
 * A Project object only contains the data and no session dependent state information. It can be serialized and deserialized in order to
 * enable loading and saving.
 */
export default class Project {
  public readonly root: Folder;
  private name: string;

  constructor(root?: Folder, name = "project") {
    if (root) {
      this.root = root;
    } else {
      this.root = new Folder("workspace", this);
    }
    this.name = name;
  }

  public getName() {
    return this.name;
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