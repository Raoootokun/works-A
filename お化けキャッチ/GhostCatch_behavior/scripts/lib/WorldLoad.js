//==================================================
// v1.0.0 / 2026/01/23
//==================================================

import { world, system, } from "@minecraft/server";
import { getTime } from "./Util";

/**
 * @callback ReloadLog
 * @param {string} name
 * @param {any[]} version
 * @returns {void}
 */


const loadStartTick = system.currentTick;

// コールバックを格納する集合（複数登録を安全に扱う）
const worldLoadCallbacks = new Set();

export class WorldLoad {
    /**
     * イベント登録
     * @param {( data:{ loadStartTick: number, loadTick: number, isReload:boolean reloadLog:ReloadLog  }) => void} callback - ワールドロード時に呼ばれる関数
     */
    static subscribe(callback) {
        worldLoadCallbacks.add(callback);
    }

    // イベント解除
    static unsubscribe(callback) {
        worldLoadCallbacks.delete(callback);
    }
}

// 定期実行を開始（system.runIntervalは環境依存のAPIを想定）
const systemNum = system.runInterval(() => {
    // プレイヤーが1人でもワールドに参加したら発火
    if (world.getPlayers().length > 0) {
        // 定期実行を停止（もうチェックする必要がないため）
        system.clearRun(systemNum);

        // 登録されたすべてのコールバックを呼ぶ
        for (const cb of worldLoadCallbacks) {
            try {
                cb({ 
                    loadStartTick: loadStartTick,
                    loadTick: system.currentTick,
                    isReload: system.currentTick - loadStartTick == 0,
                    reloadLog: reloadLog,
                });
            } catch (e) {
                // 個別コールバックの例外が全体に影響しないように保護
                console.error('WorldLoad callback error:', e);
            }
        }
    }
});


/**
 * @param {string} name 
 * @param {any[]} version 
 */
function reloadLog(name, version) {
    world.sendMessage(`§a[${getTime()}]§f[${name} v${version.join(".")}§r] Reload`);
}