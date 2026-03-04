//==================================================
// v1.0.0 / 2026/01/23
//==================================================
import { world, system, Player, } from "@minecraft/server";
import { log, Util } from "./Util";
import { WorldLoad } from "./WorldLoad";

const WORLD_DB_FIREX = "wdb";
const PLAYER_DB_FIREX = "pdb";

export class WorldDB {
    static #map = new Map();

    #rawId;
    #id;

    /**
     * @param {string} id 
     */
    constructor(id) {
        this.#rawId = id;
        this.#id = WORLD_DB_FIREX + ":" + id;
    }

    /**
     * @param {string} key 
     * @param {string | number | object} value 
     */
    set(key, value) {
        const processKey = this.#id + ":" + key;

        const saveRes = this.#save(processKey, value);
        if(!saveRes)return false;

        WorldDB.#map.set(processKey, value);
        return true;
    };

    /**
     * @param {string} key 
     * @returns {string | number | object | undefined}
     */
    get(key) {
        const processKey = this.#id + ":" + key;
        return WorldDB.#map.get(processKey);
    };

    /**
     * @param {string} key 
     * @returns {boolean}
     */
    has(key) {
        const processKey = this.#id + ":" + key;
        return WorldDB.#map.has(processKey);
    };

    /**
     * @param {string} key 
     */
    delete(key) {
        const processKey = this.#id + ":" + key;
        WorldDB.#map.delete(processKey);

        this.#save(processKey, undefined);
    }

    clear() {
        const prefix = this.#id + ":";

        for(const rawKey of WorldDB.#map.keys()) {
            if(!rawKey.startsWith(prefix))continue;

            const key = rawKey.replace(prefix, "");
            this.delete(key);
        };
    }

    /**
     * @returns {string[]}
     */
    keys() {
        const prefix = this.#id + ":";

        const arr = [];
        for(const rawKey of WorldDB.#map.keys()) {
            if(!rawKey.startsWith(prefix))continue;

            const key = rawKey.replace(prefix, "");
            arr.push(key);
        };

        return arr;
    };

    /**
     * @returns {any[]}
     */
    values() {
        const prefix = this.#id + ":";

        const arr = [];
        for(const rawKey of WorldDB.#map.keys()) {
            if(!rawKey.startsWith(prefix))continue;

            const key = rawKey.replace(prefix, "");
            arr.push(this.get(key));
        };

        return arr;
    }

    /**
     * @returns {{ key:string, value:any }[]}
     */
    entries() {
        const prefix = this.#id + ":";

        const arr = [];
        for(const rawKey of WorldDB.#map.keys()) {
            if(!rawKey.startsWith(prefix))continue;

            const key = rawKey.replace(prefix, "");
            arr.push({ key:key, value:this.get(key) });
        };

        return arr;
    }

    #save(processKey, value) {
        if(value === undefined) {
            world.setDynamicProperty(processKey);
            return true;
        }

        try{
            const strValue = JSON.stringify(value);
            world.setDynamicProperty(processKey, strValue);

            return true;
        }catch(e) {
            console.error("[WorldDB] DP save failed:", e);

            return false;
        };
    }

    static load() {
        for(const dpKey of world.getDynamicPropertyIds().filter(id => id.startsWith(WORLD_DB_FIREX))) {
            const strValue = world.getDynamicProperty(dpKey);
            if(strValue == undefined)continue;

            const value = JSON.parse(strValue);

            WorldDB.#map.set(dpKey, value);
        }
    };
};

export class PlayerDB {
    static #map = new Map();

    #rawId;
    #id;

    /**
     * @param {string} id 
     */
    constructor(id) {
        this.#rawId = id;
        this.#id = PLAYER_DB_FIREX + ":" + id;
    };

    /**
     * @param {Player} player 
     * @param {string} key 
     * @param {string | number | object} value 
     * @returns {boolean}
     */
    set(player, key, value) {
        const processKey = this.#id + ":" + player.id + ":" + key;

        const saveRes = this.#save(player, processKey, value);
        if(!saveRes)return false;

        PlayerDB.#map.set(processKey, value);
        return true;
    };

    /**
     * @param {Player} player 
     * @param {string} key 
     * @returns {string | number | object | undefined}
     */
    get(player, key) {
        const processKey = this.#id + ":" + player.id + ":" + key;
        return PlayerDB.#map.get(processKey);
    };

    /**
     * @param {Player} player 
     * @param {string} key 
     * @returns {boolean}
     */
    has(player, key) {
        const processKey = this.#id + ":" + player.id + ":" + key;
        return PlayerDB.#map.has(processKey);
    };

    /**
     * @param {Player} player 
     * @param {string} key 
     */
    delete(player, key) {
        const processKey = this.#id + ":" + player.id + ":" + key;
        PlayerDB.#map.delete(processKey);

        this.#save(player, processKey, undefined);
    }

    /**
     * @param {Player} player 
     */
    clear(player) {
        const prefix = this.#id + ":" + player.id + ":";
    
        for(const rawKey of PlayerDB.#map.keys()) {
            if(!rawKey.startsWith(prefix))continue;

            const key = rawKey.replace(prefix, "");
            this.delete(player, key);
        };
    };

    /**
     * @param {Player} player 
     * @returns {string[]}
     */
    keys(player) {
        const prefix = this.#id + ":" + player.id + ":";

        const arr = [];
        for(const rawKey of PlayerDB.#map.keys()) {
            if(!rawKey.startsWith(prefix))continue;

            const key = rawKey.replace(prefix, "");
            arr.push(key);
        };

        return arr;
    };

     /**
     * @param {Player} player 
     * @returns {any[]}
     */
    values(player) {
        const prefix = this.#id + ":" + player.id + ":";

        const arr = [];
        for(const rawKey of PlayerDB.#map.keys()) {
            if(!rawKey.startsWith(prefix))continue;

            const key = rawKey.replace(prefix, "");
            arr.push(this.get(key));
        };

        return arr;
    };

    /**
     * @param {Player} player 
     * @returns {{ key:string, value:any }[]}
     */
    entries(player) {
        const prefix = this.#id + ":" + player.id + ":";

        const arr = [];
        for(const rawKey of PlayerDB.#map.keys()) {
            if(!rawKey.startsWith(prefix))continue;

            const key = rawKey.replace(prefix, "");
            arr.push({ key:key, value:this.get(key) });
        };

        return arr;
    }

    #save(player, processKey, value) {
        if(value === undefined) {
            player.setDynamicProperty(processKey);
            return true;
        }

        try{
            const strValue = JSON.stringify(value);
            player.setDynamicProperty(processKey, strValue);

            return true;
        }catch(e) {
            console.error("[PlayerDB] DP save failed:", e);

            return false;
        };
    }

    static load(player) {
        for(const dpKey of player.getDynamicPropertyIds().filter(id => id.startsWith(PLAYER_DB_FIREX))) {
            const strValue = player.getDynamicProperty(dpKey);
            if(strValue == undefined)continue;

            const value = JSON.parse(strValue);

            PlayerDB.#map.set(dpKey, value);
        }
    };

    static destroy(player) {
        for(const dpKey of player.getDynamicPropertyIds().filter(id => id.startsWith(PLAYER_DB_FIREX))) {
            const strValue = world.getDynamicProperty(dpKey);
            if(strValue == undefined)continue;

            const value = JSON.parse(strValue);

            PlayerDB.#map.delete(dpKey);
        }
    };
}

//ワールドロード時に実行
WorldLoad.subscribe(ev => {
    WorldDB.load();

    for(const player of world.getPlayers()) {
        PlayerDB.load(player);
    }
});

//ワールド参加に実行
world.afterEvents.playerSpawn.subscribe(ev => {
    const { player, initialSpawn } = ev;

    if(!initialSpawn)return;
    PlayerDB.load(player);
})

//ワールド退出時に実行
world.beforeEvents.playerLeave.subscribe(ev => {
    const { player } = ev;

    PlayerDB.destroy(player);
});