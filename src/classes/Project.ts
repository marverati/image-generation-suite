import Folder from "./Folder";
import Snippet from "./Snippet";

export default class Project {
  public readonly root = new Folder("workspace", this);

  constructor() {
    console.log("Created project", this);
    // Random test stuff
    const folder = new Folder("Test");
    const snip1 = new Snippet("Snippet 1");
    const snip2 = new Snippet("Snippet 2");
    const snip3 = new Snippet("Inner Snippet");
    folder.append(snip3);
    this.root.append(snip1);
    this.root.append(snip2);
    this.root.append(folder);
  }

}