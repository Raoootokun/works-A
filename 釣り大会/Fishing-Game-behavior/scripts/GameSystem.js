import { world, system, Player, ItemStack, } from "@minecraft/server";
import { log, Util } from "./lib/Util";
import { Score } from "./Score";
import { Item } from "./Item";
import { worldDB } from "./main";
import { ExHud } from "./ExHud";
import { CommonUtil } from "./CommonUtil";

export class GameSystem {
    /**
     * 一秒毎に実行
     * @param {Player} player 
     */
    static loop(player) { 
        if(player.time <= 0) {
            GameSystem.finish(player);
            return;
        }

        if(player.time == 60) {
            player.onScreenDisplay.setTitle(`§1`, {
                fadeInDuration:0, stayDuration:60, fadeOutDuration:20,
                subtitle: `残り 1分 です`
            });
            player.playSound(`random.click`)
        };
        if(player.time == 30) {
            player.onScreenDisplay.setTitle(`§1`, {
                fadeInDuration:0, stayDuration:60, fadeOutDuration:20,
                subtitle: `残り 30秒 です`
            });
            player.playSound(`random.click`)
        }

        player.time--;
    }

    /**
     * objective の作成 & 初期化
     * スコア表を作成
     */
    static init() {
        try{
            world.scoreboard.removeObjective(`fg_point`);
        }catch(e){};

        worldDB.set(`scores`, {
            'minecraft:cod': 10,
            'minecraft:salmon': 15,
            'minecraft:pufferfish': 25,
            'minecraft:tropical_fish': 30,

            'fg:golditou': 35,
            'fg:goldfish': 40,
            'fg:itou': 50,
            'fg:boni': 55,
        });
        worldDB.set(`time`, 300);
         
        world.scoreboard.addObjective(`fg_point`);
        world.sendMessage(`[釣り大会] オブジェクト/ポイントを初期化しました`);
    };

    /**
     * fg_join付与、案内表示
     * @param {Player} player 
     */
    static join(player) {
        const state = GameSystem.getState(player);
        if(state == `fg_join`) {
            player.sendMessage(`§c現在ゲームに参加中です。`);
            Util.playSoundP(player, `note.bass`, { count:5 });
            return;
        };

        if(state == `fg_play`) {
            player.sendMessage(`§c現在ゲームをプレイ中です。`);
            Util.playSoundP(player, `note.bass`, { count:5 });
            return;
        };

        //他ゲームに参加していないか
        if(CommonUtil.checkInGame(player))return;

        GameSystem.setState(player, "fg_join");

        player.sendMessage(`釣り大会に参加しました。\n開始ボタンを押したらゲームが開始されます。`);
        player.playSound(`random.orb`, { pitch:1.2 });
    }

    /**
     * fg_join,fg_playを削除
     * @param {Player} player 
     */
    static exit(player) {
        GameSystem.setState(player, undefined);
        Item.clearFishingRod(player);
        delete player.time;
        
        player.sendMessage(`釣りゲームを退出しました。\n再びゲームを開始するまでスコアはリセットされません。`);
        player.playSound(`random.orb`, { pitch:1.2 });

        ExHud.sidebarShow(player);
    }

    /**
     * fg_play付与, 釣り竿付与、スコア初期化
     * @param {Player} player 
     */
    static play(player) {
        const state = GameSystem.getState(player);
        if(state == `fg_play`) {
            player.sendMessage(`§c現在ゲームをプレイ中です。`);
            Util.playSoundP(player, `note.bass`, { count:5 });
            return;
        };

        if(state != `fg_join`) {
            player.sendMessage(`§c参加ボタンを先に押してください。`);
            Util.playSoundP(player, `note.bass`, { count:5 });
            return;
        }

        //釣り竿を付与
        const res = Item.add(player);
        //付与を失敗した場合は中断
        if(!res) {
            player.sendMessage(`§cインベントリに空きスロットがないため、ゲームを開始できません。\nもう一度開始ボタンを教えてください。`);
            return;
        }

        Score.init(player);

        //残り時間を設定
        player.time = worldDB.get(`time`);
        GameSystem.setState(player, "fg_play");

        player.onScreenDisplay.setTitle(`釣り大会`, {
            fadeInDuration:0, stayDuration:60, fadeOutDuration:20,
            subtitle: `§c開始`
        });
        player.playSound(`random.levelup`, { pitch:0.8 });
        player.sendMessage(`§c釣り大会開始!!`);
    }

    /**
     * アイテムを釣ったときに実行
     * ポイント付与、アイテム削除
     * @param {Player} player 
     * @param {ItemStack} itemStack  
     */
    static fishing(player, itemStack) {
        const nowState = GameSystem.getState(player);
        if(nowState != `fg_play`)return;

        const fishId = itemStack.typeId;
        //連れたアイテムを削除
        Item.clearFish(player, itemStack);

        //釣り竿を新しくする
        Item.repairFishingRod(player);

        //スコアを追加
        const score = Score.add(player, fishId);
        if(!score)return;
        
        player.sendMessage(`§b${itemStack.nameTag}§fを釣り上げた。(+${score})`);
    }

    /**
     * ゲーム終了時に処理
     * stateを fg_join に変更
     * タイトル、ポイント表示
     * @param {Player} player 
     */
    static finish(player) {
        Item.clearFishingRod(player);
        GameSystem.setState(player, "fg_join");
        delete player.time;

        const score = Score.get(player);

        player.onScreenDisplay.setTitle(`釣り大会`, {
            fadeInDuration:0, stayDuration:60, fadeOutDuration:20,
            subtitle: `終了`
        });
        player.playSound(`random.levelup`, { pitch:0.8 });
        player.sendMessage(`- 得点: §b${score} 点§f -`);
    }

    /**
     * ワールド参加時、リスポーン時に実行
     * fg_join, fg_playがついている場合、退出処理を実行
     * @param {Player} player 
     */
    static check(player) {
        const hasTag = player.hasTag(`fg_join`) || player.hasTag(`fg_play`);
        if(!hasTag)return;

        GameSystem.exit(player);
    }

    /**
     * プレイヤーの状態を取得   
     * fg_join, fg_play, undefined
     * @param {Player} player 
     * @returns {string | undefined}
     */
    static getState(player) {
        return player.state;
    };

    /**
     * プレイヤーの状態を設定
     * fg_join, fg_play, undefined
     * @param {Player} player 
     * @param {string | undefined} state 
     */
    static setState(player, state) {
        for(const tag of player.getTags().filter(tag => tag.startsWith(`fg_`))) {
            player.removeTag(tag);
        };

        if(state) {
            player.state = state;
            player.addTag(state);
        }else {
            delete player.state;
        }
    };

    /**
     * 状態が fg_play のプレイヤーを取得します
     */
    static getPlayers() {
        return world.getPlayers().filter(player => GameSystem.getState(player) == `fg_play` );
    }
}


