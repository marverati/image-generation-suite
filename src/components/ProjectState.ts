import Project from "@/classes/Project";
import Snippet from "@/classes/Snippet";

export default class ProjectState {
  private project: Project;
  private currentlyOpenSnippet: Snippet | null = null;


  public constructor(project: Project = new Project()) {
    this.project = project;
  }

  public setProject(project: Project): void {
    this.project = project;
  }

  public getProject(): Project {
    return this.project;
  }

  public openSnippet(snippet: Snippet | null): void {
    this.currentlyOpenSnippet = snippet;
  }

  public getOpenSnippet(): Snippet | null {
    return this.currentlyOpenSnippet;
  }
}