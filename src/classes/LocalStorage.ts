import Project from "./Project";
import { ProjectStorage } from "./ProjectStorage";
import { projectStorageManager } from "./ProjectStorageManager";

/**
 * ProjectStorage storing user project in their browser's localstorage.
 */
export class LocalStorage extends ProjectStorage {
    private enabled = true;

    public disable() {
        this.enabled = false;
    }

    public enable() {
        this.enabled = true;
    }

    public isRedundant(): boolean {
        return true;
    }

    public isAvailable() {
        return this.enabled;
    }

    public storeJson(json: string, projectName: string): Promise<boolean> {
        const user = this.manager?.getUserName() ?? "unkown";
        const slotKey = this.getKey(user, projectName);
        localStorage.setItem(slotKey, json);
        return Promise.resolve(true);
    }

    public load(projectName = ""): Project | null {
        const user = this.manager?.getUserName() ?? "unkown";
        const slotKey = this.getKey(user, projectName);
        const json = localStorage.getItem(slotKey);
        if (!json) {
            throw new Error("Project could not be loaded from localstorage");
        }
        const obj = JSON.parse(json);
        const project = Project.fromJSON(obj);
        return project;
    }

    private getKey(userName: string, projectName: string): string {
        return "project_" + userName + "|" + projectName;
    }
}
