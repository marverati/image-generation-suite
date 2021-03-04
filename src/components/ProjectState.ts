import Project from "@/classes/Project";
import Snippet from "@/classes/Snippet";
import { setAnimationSpeed } from "@/imaging/animation";

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
      setAnimationSpeed();
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
        code = "if (this.w == null) Object.defineProperty(this, 'w', { get: function() {return previewCanvas.width} });"
            + "if (this.h == null) Object.defineProperty(this, 'h', { get: function() {return previewCanvas.height} });"
            + "clipRect();" + code;
        const func = new Function("canvas", "context", code);
        func(canvas, canvas.getContext("2d"));
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