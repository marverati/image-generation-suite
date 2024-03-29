import Project from "@/classes/Project";
import Snippet from "@/classes/Snippet";
import { animator } from "@/imaging/imageUtil";

const initialCode = `
if (this.w == null) Object.defineProperty(this, 'w', { get: function() {return previewCanvas.width} });
if (this.h == null) Object.defineProperty(this, 'h', { get: function() {return previewCanvas.height} });
clipRect();
transformCoords();
`

/**
 * A ProjectState object is basically a wrapper around a Project (or user workspace) containing all the state
 * information that's relevant within a session of a user. While the Project object only contains persistable
 * data (primarily the code snippets and folder structure), a ProjectState adds information such as which
 * snippet is currently opened, allows executing the current snippet and handles errors while doing so.
 */
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
    if (snippet !== this.currentlyOpenSnippet) {
      this.currentlyOpenSnippet = snippet;
      // Changing snippet resets animation speed
      animator.setAnimationSpeed();
    }
  }

  public getOpenSnippet(): Snippet | null {
    return this.currentlyOpenSnippet;
  }

  public runCode(): void {
    if (this.currentlyOpenSnippet != null) {
      this.currentlyOpenSnippet.clearParams();
      let code = this.currentlyOpenSnippet.getCode();
      try {
        const canvas = (window as any).previewCanvas as HTMLCanvasElement;
        // Add w & h getters to code
        code = initialCode + code;
        const func = new Function("canvas", "context", "refresh", code);
        func(canvas, canvas.getContext("2d"), () => this.runCode());
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