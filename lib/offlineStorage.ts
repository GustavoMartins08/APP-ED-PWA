import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface OfflineDB extends DBSchema {
    networkCache: {
        key: string;
        value: {
            data: any;
            timestamp: number;
        };
    };
}

const DB_NAME = 'ed-offline-db';
const STORE_NAME = 'networkCache';

class OfflineStorage {
    private dbPromise: Promise<IDBPDatabase<OfflineDB>>;

    constructor() {
        this.dbPromise = openDB<OfflineDB>(DB_NAME, 1, {
            upgrade(db) {
                db.createObjectStore(STORE_NAME);
            },
        });
    }

    async set(key: string, data: any) {
        try {
            const db = await this.dbPromise;
            await db.put(STORE_NAME, {
                data,
                timestamp: Date.now(),
            }, key);
        } catch (e) {
            console.warn('Offline storage write failed', e);
        }
    }

    async get(key: string) {
        try {
            const db = await this.dbPromise;
            const entry = await db.get(STORE_NAME, key);
            return entry?.data;
        } catch (e) {
            console.warn('Offline storage read failed', e);
            return null;
        }
    }

    async clear() {
        const db = await this.dbPromise;
        await db.clear(STORE_NAME);
    }
}

export const offlineStorage = new OfflineStorage();
