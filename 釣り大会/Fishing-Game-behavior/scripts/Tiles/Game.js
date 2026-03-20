import { world, system, Player, ItemStack, } from "@minecraft/server";
import { log, Util } from "../lib/Util";
import { CommonUtil } from "../CommonUtil";
import { ExHud } from "../ExHud";

export class TilesGame {
    /** @type {boolean} */ static ingame = false;
    /** @type {Player} */ static player = undefined;


    /**
     * 参加
     * @param {Player} player 
     */
    static join(player) {
        const state = TilesGame.getState(player);
        if(state == `join`) {
            player.sendMessage(`§c現在ゲームに参加中です。`);
            Util.playSoundP(player, `note.bass`, { count:5 });
            return;
        };

        if(state == `play`) {
            player.sendMessage(`§c現在ゲームをプレイ中です。`);
            Util.playSoundP(player, `note.bass`, { count:5 });
            return;
        };

        //他ゲームに参加していないか
        if(CommonUtil.checkInGame(player))return;

        player.addTag(`ts_join`);

        player.sendMessage(`瓦割りに参加しました。\n開始ボタンを押したらゲームが開始されます。`);
        player.playSound(`random.orb`, { pitch:1.2 });
    }


    /**
     * プレイ   
     * @param {Player} player 
     */
    static play(player) {
        const state = TilesGame.getState(player);
        if(state == `join`) {
            player.sendMessage(`§c現在ゲームに参加中です。`);
            Util.playSoundP(player, `note.bass`, { count:5 });
            return;
        };

        if(state == `play`) {
            player.sendMessage(`§c参加ボタンを先に押してください。`);
            Util.playSoundP(player, `note.bass`, { count:5 });
            return;
        };

        //ほかのプレイヤーがすでにプレイ中の場合
        if(TilesGame.player) {
            player.sendMessage(`§c現在他のプレイヤーがプレイ中です。`);
            Util.playSoundP(player, `note.bass`, { count:5 });
            return;
        }


        player.removeTag(`ts_join`);
        player.addTag(`ts_play`);
        TilesGame.start();

        return;
        player.onScreenDisplay.setTitle(`釣り大会`, {
            fadeInDuration:0, stayDuration:60, fadeOutDuration:20,
            subtitle: `§c開始`
        });
        player.playSound(`random.levelup`, { pitch:0.8 });
        player.sendMessage(`§c釣り大会開始!!`);
    }


    /**
     * 退出
     * @param {Player} player 
     */
    static exit(player) {
        player.removeTag(`ts_join`);
        player.removeTag(`ts_play`);
        player.sendMessage(`瓦割りを退出しました。`);
        player.playSound(`random.orb`, { pitch:1.2 });

        ExHud.sidebarShow(player);
    }


    /**
     * 状態を取得
     */
    static getState(player) {
        const tags = player.getTags();
        if(tags.includes(`ts_join`))return `join`;
        else if(tags.includes(`ts_play`))return `play`;
        else return undefined;
    }


    /**
     * 開始
     */
    static start(player) {
        TilesGame.ingame = true;
        TilesGame.player = player;

        TilesGame.player.onScreenDisplay.setTitle(`§920枚`, {
            fadeInDuration:0, stayDuration:100, fadeOutDuration:20,
            subtitle: `§f力を溜めて瓦を割ろう`
        });
        TilesGame.player.playSound(`mob.enderdragon.death`, { pitch:1 });
    }


    static loop() {
        const systemNum = system.runInterval(() => {
            if(!TilesGame.ingame || !TilesGame.player || !TilesGame.player.isValid) {
                return system.clearRun(systemNum);
            }
        })
    }
}