import { deCrypto, enCrypto } from '../crypto'

import Dexie, { Table } from 'dexie';

export interface ChatHistory {
    id?: number;
    data: any;

}

interface chatData {
    expire?: number | null;
    crypto?: boolean

}

export class chatHistoryDatabase extends Dexie {
    // 'friends' is added by dexie when declaring the stores()
    // We just tell the typing system this is the case
    chatHistory!: Table<ChatHistory>;
    constructor() {
        super('chatHistoryDatabase');
        this.version(1).stores({
            chatHistory: 'id, data' // Primary key and indexed props
        });

    }

}

export const db = new chatHistoryDatabase();

export class chatHistoryDb implements chatData {

    expire: number | null = null
    crypto: boolean = false
    db: any = null
    constructor(expire?: number, crypto?: boolean) {
        this.expire = expire || 0;
        this.crypto = crypto || false;
        this.db = new chatHistoryDatabase()

    }
    async set<T = any>(key: string, data: T) {
        const storageData: StorageData<T> = {
            data,
            expire: this.expire !== null ? new Date().getTime() + this.expire * 1000 : null,
        }

        const json = this.crypto ? enCrypto(storageData) : JSON.stringify(storageData)
        if (this.db) {
            await this.db.transaction('rw', this.db.chatHistory, async () => {
                try {
                    return await this.db.chatHistory.put({ id: key, data: json })
                } catch (e) {
                    console.warn(e)

                }

            })
        }

        // window.localStorage.setItem(key, json)
    }
    async get(key: string, cb: (json: any) => void) {
        // console.log('cb',cb)
        // const json = window.localStorage.getItem(key)
        try {
            await this.db.transaction('r', this.db.chatHistory, async () => {
                // Transaction block
                const json = await this.db.chatHistory.get(key);
                // cb(json)
                if (json.data) {
                    let storageData: StorageData | null = null

                    try {
                        storageData = this.crypto ? deCrypto(json.data) : JSON.parse(json.data)
                    }
                    catch (e) {
                        console.error(e)
                        // Prevent failure
                    }
                    // console.warn('storageData', storageData)
                    if (storageData) {
                        const { data, expire } = storageData
                        // console.warn('storageData', data)
                        // return storageData
                        cb(data)
                        // if (expire === null || expire >= Date.now()) {
                        //     console.warn('====cb====')
                        //      cb(data)
                        //      return true
                        // }else{
                        //     console.warn('storageData', data)
                        // }

                    }
                    this.remove(key)
                    return null

                }else{
                    console.warn('null data')
                }

             
            });

        } catch (e) {
            // console.error(e)
        }

    }
    remove(key: string) {
        // window.localStorage.removeItem(key)
    }
    clear() {
        // window.localStorage.clear()
    }

}

export const chatDB = new chatHistoryDb()

interface StorageData<T = any> {
    data: T
    expire: number | null
}

export function createLocalStorage(options?: { expire?: number | null; crypto?: boolean }) {
    const DEFAULT_CACHE_TIME = 60 * 60 * 24 * 7

    const { expire, crypto } = Object.assign(
        {
            expire: DEFAULT_CACHE_TIME,
            crypto: true,
        },
        options,
    )

    function set<T = any>(key: string, data: T) {
        const storageData: StorageData<T> = {
            data,
            expire: expire !== null ? new Date().getTime() + expire * 1000 : null,
        }

        const json = crypto ? enCrypto(storageData) : JSON.stringify(storageData)
        window.localStorage.setItem(key, json)
    }

    function get(key: string) {
        const json = window.localStorage.getItem(key)
        if (json) {
            let storageData: StorageData | null = null

            try {
                storageData = crypto ? deCrypto(json) : JSON.parse(json)
            }
            catch {
                // Prevent failure
            }

            if (storageData) {
                const { data, expire } = storageData
                if (expire === null || expire >= Date.now())
                    return data
            }

            remove(key)
            return null
        }
    }

    function remove(key: string) {
        window.localStorage.removeItem(key)
    }

    function clear() {
        window.localStorage.clear()
    }

    return {
        set,
        get,
        remove,
        clear,
    }
}

export const ls = createLocalStorage()

export const ss = createLocalStorage({ expire: null, crypto: false })
