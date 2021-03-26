import Project from "./Project";
import { ProjectStorageManager } from "./ProjectStorageManager";

/**
 * ProjectStorage is an abstract class unifying different possible implementations of storing user projects / workspaces.
 * Examples of implementations of this would be classes that are able to persist and load projects from e.g. a PHP
 * backend hosted on a specific server, the browser's localstorage, the file system, or even an import/export
 * functionality that doesn't persist anything itself but leaves that to the user.
 */
export abstract class ProjectStorage {
    protected manager: ProjectStorageManager | null = null;

    public store(project: Project): Promise<boolean> {
        if (!this.isAvailable()) {
            return Promise.resolve(false);
        }
        const obj = project.toJSON();
        const json = JSON.stringify(obj);
        return this.storeJson(json, project.getName());
    }

    public isAvailable(): boolean {
        return true;
    }

    /**
     * Any storage that is supposed to be used every time as fallback storage, even if a higher priority storage
     * was successful, should return true here. It will be invoked while storing whenever possible.
     *
     * @returns True if the storage is a redundant backup that's always to be used.
     */
    public isRedundant(): boolean {
        return false;
    }

    public setManager(manager: ProjectStorageManager): void {
        if (this.manager != null) {
            throw new Error("Tried to register a storage to multiple storage managers");
        }
        this.manager = manager;
    }

    protected abstract storeJson(json: string, projectName: string): Promise<boolean>;

    public abstract load(name: string): Project | null;
}
