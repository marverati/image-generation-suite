import { ImportExportStorage } from "./ImportExportStorage";
import { LocalStorage } from "./LocalStorage";
import { projectStorageManager } from "./ProjectStorageManager";

export const importExportStorage = new ImportExportStorage();

export function setupProjectStorage() {
    const manager = projectStorageManager;
    manager.registerStorage(new LocalStorage());
    manager.registerStorage(importExportStorage);
}
