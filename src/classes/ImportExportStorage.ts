import { downloadText } from "@/util";
import Project from "./Project";
import { ProjectStorage } from "./ProjectStorage";

/**
 * ProjectStorage that doesn't actively store things, but instead is an interface directly to the user to allow
 * importing/exporting code in form of text files.
 */
export class ImportExportStorage extends ProjectStorage {

    protected stringify(obj: Record<string, any>): string {
        return JSON.stringify(obj, null, 4);
    }

    public storeJson(json: string, projectName: string): Promise<boolean> {
        downloadText("igs_workspace.txt", json);
        return Promise.resolve(true);
    }

    public load(projectName = ""): Project | null {
        // TODO trigger open file dialog to allow user to import without drag & drop
        return null;
    }

    public importDroppedFile(event: DragEvent, skipAlerts = false): Promise<Project> {
        event.preventDefault();
        event.stopPropagation();
        const files = event.dataTransfer?.files ?? [];
        return new Promise((resolve, reject) => {
            if (files.length === 1) {
                const file = files[0];
                if (file.type === "text/plain") {
                    const sure = skipAlerts || confirm("Are you sure you want to import another igs project?"
                        + " Your current project will be lost. Ensure to export it beforehand.");
                    if (sure) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            const json = e.target?.result as string;
                            if (json == null) {
                                reject("File could not be loaded");
                            }
                            const obj = JSON.parse(json);
                            const project = Project.fromJSON(obj);
                            resolve(project);
                        }
                        reader.readAsBinaryString(file);
                    } else {
                        reject("Import aborted");
                    }
                } else {
                    console.log("Dropped invalid file type: ", file.type);
                    reject("Invalid file dropped; only plain text files containing json are allowed");
                }
            } else {
                reject("Illegal number of files dropped; just single text file allowed");
            }
        })
    }
}
