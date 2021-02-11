import Project from "@/classes/Project";
import Snippet from "@/classes/Snippet";

export default class ProjectState {
  private project: Project;
  private currentlyOpenSnippet: Snippet | null = null;
  private previewImage: HTMLImageElement | null = null;

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

  public runCode(): void {
    if (this.currentlyOpenSnippet != null) {
      this.currentlyOpenSnippet.clearParams();
      const code = this.currentlyOpenSnippet.getCode();
      try {
        const func = new Function(code);
        func();
      } catch (e) {
        this.handleError(e);
      }
    }
  }

  public handleError(e: Error): void {
    console.error(e);
  }

  public setPreviewImage(img: HTMLImageElement) {
    this.previewImage = img;
  }

  public getPreviewImage(): HTMLImageElement | null {
    return this.previewImage;
  }
}