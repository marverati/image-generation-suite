import Project from "./Project";
import { ProjectStorage } from "./ProjectStorage";

/**
 * The ProjectStorageManager is a class combining all existing ProjectStorage implementations. These implementations
 * can register themselves (or be registered) with the manager. It might make sense to only have one such manager
 * and have that manager be available to any other class, so usually this is used like a Singleton, but it is not
 * technically enforced.
 * The most frequent usage of this is by calling store(project). It then automatically delegates this to the most
 * preferred storage available. If a storage is not currently available, the next one in line will store it instead.
 * This can e.g. happen when a PHP backend is the preferred storage, but it is not currently reachable, so the
 * localstorage is used instead.
 */
export class ProjectStorageManager {
    private storages: ProjectStorage[] = [];
    private userName: string;

    public constructor() {
        this.userName = "user";
    }

    public getAllStorages() {
        return this.storages;
    }

    public getPreferredStorage(): ProjectStorage | null {
        return this.storages[0] ?? null;
    }

    public getAvailableStorage(): ProjectStorage | null {
        return this.storages.find(storage => storage.isAvailable()) ?? null;
    }

    public setUserName(name: string): void {
        this.userName = name;
    }

    public getUserName(): string {
        return this.userName;
    }

    /**
     * Store the given project. Will try to store it in primary storage, plus all redundant backup storages.
     * @param project - The project to save.
     * @returns Resolves to true if primary storage was successful, false if it wasn't but a different storage was. If the
     *          project couldn't be stored at all, an error will be thrown. 
     */
    public async store(project: Project): Promise<boolean> {
        let stored = false, storedInPrimary = false;
        for (let i = 0; i < this.storages.length; i++) {
            const storage = this.storages[i];
            console.log("Poking ", storage.constructor.name);
            if (!stored || storage.isRedundant()) {
                try {
                    console.log("Is available, trying to store");
                    const success = await storage.store(project);
                    if (success) {
                        console.log("done!");
                        stored = true;
                        if (i === 0) { storedInPrimary = true; }
                    }
                } catch (e) {
                    console.error(e);
                }
            }
        }
        return stored ? storedInPrimary : Promise.reject(new Error("Could not store the project in any available storage"));
    }

    public async load(name = ""): Promise<Project> {
        console.log("Trying to load ", name, " from ", this.storages.length);
        for (let i = 0; i < this.storages.length; i++) {
            const storage = this.storages[i];
            try {
                console.log(name, storage.constructor.name);
                const project = await storage.load(name);
                if (project) {
                    return project;
                }
            } catch (e) {
                console.error(e);
            }
        }
        return Promise.reject(new Error("Could not find the project in any available storage"));
    }

    /**
     * Register a new project storage implementation to this manager. A project storage can only be registered with one
     * manager at any time.
     *
     * @param storage - The project storage to register.
     */
    public registerStorage(storage: ProjectStorage) {
        console.log("Registering ProjectStorage ", storage.constructor.name);
        this.storages.push(storage);
        storage.setManager(this);
    }
}

export const projectStorageManager = new ProjectStorageManager();
