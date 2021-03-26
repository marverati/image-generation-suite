import { LocalStorage } from "./LocalStorage";
import { projectStorageManager } from "./ProjectStorageManager";

export function setupProjectStorage() {
    const manager = projectStorageManager;
    manager.registerStorage(new LocalStorage());
}