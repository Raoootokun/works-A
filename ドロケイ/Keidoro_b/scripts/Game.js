import { world, system, Player, } from "@minecraft/server";
import { WorldLoad } from "./lib/WorldLoad";
import { log, Util } from "./lib/Util";
import { ExHud } from "./lib/ExHud";

import { Position } from "./Position";
import { Role } from "./Role";
import { Marker } from "./Marker";
import { Vector } from "./lib/Vector";
import { Generator } from "./Generator";
import { CommonUtil } from "./CommonUtil";
import { Config } from "./Config";
import { Armor } from "./Armor";




export class Game {
    /** @type {boolean} */ static ingame = false;
    /** @type {Player[]} */ static players = [];
    /** @type {number} */ static time = 0;
    /** @type {number} */ static glowTime = 0;
    /** @type {number} */ static phase = 0;


    /**
     * プレイヤーを参加状態にする
     * @param {Player} player 
     */
    static join(player) {
        //ゲームが進行中の場合
        if(Game.ingame) {
            player.sendMessage(`§c現在ゲームが進行中のため、参加することはできません。`);
            Util.playSoundP(player, `note.bass`, { count:5 });
            return;
        }

        const state = Game.getState(player)
        //すでに参加状態の場合
        if(state == `join`) {
            player.sendMessage(`§c現在ゲームに参加中です。`);
            Util.playSoundP(player, `note.bass`, { count:5 });
            return;
        };

        //プレイ中の場合
        if(state == `play`) {
            player.sendMessage(`§c現在ゲームをプレイ中です。`);
            Util.playSoundP(player, `note.bass`, { count:5 });
            return;
        };

        //他ゲームに参加していないか
        if(CommonUtil.checkInGame(player))return;

        //roleリセット
        Role.set(player);
 
        player.sendMessage(`ドロケイに参加しました。\n§dゲームマスター§fが開始するまでお待ちください。`);
        player.addTag(`kd_join`);
        player.playSound(`random.orb`, { pitch:1.2 });
        if(Position.INIT)player.teleport(Position.INIT);
    }


    /**
     * プレイヤーを非参加状態にする
     * @param {Player} player 
     */
    static exit(player) {
        //ゲームが進行中の場合
        if(Game.ingame) {
            player.sendMessage(`§c現在ゲームが進行中のため、退出することはできません。`);
            Util.playSoundP(player, `note.bass`, { count:5 });
            return;
        }

        //roleリセット
        Role.set(player);
        Marker.set(player, 0);
        Armor.detach(player);

        player.sendMessage(`ドロケイから退出しました。`);
        player.removeTag(`kd_join`);
        player.removeTag(`kd_play`);
        player.playSound(`random.orb`, { pitch:1.2 });

        player.removeEffect(`resistance`);
        player.removeEffect(`saturation`);

        player.nameTag = player.name;

        if(Position.INIT)player.teleport(Position.INIT);

        ExHud.sidebarShow(player);
    }


    /**
     * ワールド参加じに途中参加かどうかを判別します
     * @param {Player} player 
     */
    static load(player) {
        const state = Game.getState(player);

        //joinの場合は退出
        if(state == `join`)return Game.exit(player);

        //playの場合
        if(state == `play`) {
            //ゲーム中か
            if(Game.ingame)return;

            return Game.exit(player);
        }
    }


    static getState(player) {
        if(!player || !player.isValid)return undefined;
        
        if(player.hasTag(`kd_join`))return `join`;
        else if(player.hasTag(`kd_play`))return `play`;
        else return undefined;
    };


    /**
     * カウントダウンを開始
     */
    static startCountDown(gameMaster) {
        //ゲームが進行中の場合
        if(Game.ingame)return gameMaster.sendMessage(`§6[ドロケイ] §c現在ゲームを進行中です`);

        //参加プレイヤーを取得
        Game.players = world.getPlayers({ tags:[ `kd_join` ] });
        //参加プレイヤーが2人以上いない場合
        // if(Game.players.length < 2)return gameMaster.sendMessage(`§6[ドロケイ] §c参加人数が足りません(現在: ${Game.players.length}人、必要: 2人以上)`);
        // //警察がいない場合
        // if(Game.players.filter(p => Police.is(p)).length == 0)return gameMaster.sendMessage(`§6[ドロケイ] §c警察の人数が足りません(現在: 0人、必要: 1人以上)`);
        // //泥棒がいない場合
        // if(Game.players.filter(p => !Police.is(p)).length == 0)return gameMaster.sendMessage(`§6[ドロケイ] §c泥棒の人数が足りません(現在: 0人、必要: 1人以上)`);

        //座標の設定ができんていない場合
        if(!Position.INIT)return gameMaster.sendMessage(`§6[ドロケイ] §c初期座標が設定されていません`);
        if(!Position.RESPAWN)return gameMaster.sendMessage(`§6[ドロケイ] §c復活座標が設定されていません`);
        if(!Position.PRISON)return gameMaster.sendMessage(`§6[ドロケイ] §c牢屋座標が設定されていません`);
        if(!Position.GENERATOR_1)return gameMaster.sendMessage(`§6[ドロケイ] §c発電機1座標が設定されていません`);
        if(!Position.GENERATOR_1)return gameMaster.sendMessage(`§6[ドロケイ] §c発電機1座標が設定されていません`);

        world.gameRules.locatorBar = false;

        let cnt = 3;
        const systemNum = system.runInterval(() => {

            if(cnt == 0) {
                Game.start();
                return system.clearRun(systemNum);
            }

            for(const player of Game.players) {
                player.onScreenDisplay.setTitle(`§f${cnt}`, {
                    fadeInDuration:0, stayDuration:40, fadeOutDuration:20,
                    subtitle: `§6`
                });
                Util.playSoundP(player, `note.harp`, { count:1, pitch:0.5 });
            }

            cnt--;
        }, 20);
    }


    /**
     * 開始
     */
    static start() {
        Game.ingame = true;
        Game.time = Config.POLICE_OPEN_TIME;
        Game.glowTime = 0;
        Game.phase = 1;

        //発電機をリセット
        Generator.reset();

        for(const player of Game.players) {
            if(!player || !player.isValid)continue;

            //参加状態にする
            player.removeTag(`kd_join`);
            player.addTag(`kd_play`);

            player.onScreenDisplay.setTitle(`§fドロケイ`, {
                fadeInDuration:0, stayDuration:100, fadeOutDuration:20,
                subtitle: `§6START`
            });
            Util.playSoundP(player, `block.end_portal.spawn`, { delay:5 });
            Util.resetCollision(player);
            
            const role = Role.get(player)
            if(role == `police`) { //警察
                player.sendMessage(`§6ドロケイ START!!\n§f制限時間内に泥棒を全員捕まえろ!!`);
                player.teleport(Position.PRISON);
            }else { //泥棒
                Role.set(player, `thief`);
                Role.setLife(player, 1);
                Role.setResistane(player, 0);

                player.sendMessage(`§6ドロケイ START!!\n§f制限時間まで警察から逃げきれ!!`);
                player.teleport(Position.RESPAWN);
            }
            
            Marker.set(player, 0);
        }

        system.runTimeout(() => {
            if(!Game.ingame)return;

            for(const player of Game.players) {
                if(!player || !player.isValid)continue;

                player.onScreenDisplay.setTitle(`§f`, {
                    fadeInDuration:0, stayDuration:60, fadeOutDuration:20,
                    subtitle: `§c警察開放まで残り: ${Game.time}秒`
                });
                player.sendMessage(`§c警察開放まで残り: ${Game.time}秒!!`);
                Util.playSoundP(player, `random.levelup`, { pitch:0.7 });    
            }
        }, 20 * 3);
    }

 
    /**
     * 警察開放
     */
    static openPolice() {
        if(!Game.ingame)return;

        Game.time = Config.TIME;
        Game.glowTime = Config.GLOW_INTERVAL_TIME;
        Game.phase = 2;

        for(const player of Game.players) {
            if(!player || !player.isValid)continue;

            player.onScreenDisplay.setTitle(`§f`, {
                fadeInDuration:0, stayDuration:60, fadeOutDuration:20,
                subtitle: `§c>>  警察開放 <<`
            });
            player.sendMessage(`§c警察開放!!`);
            Util.playSoundP(player, `mob.spawn.wither`, {});
            
            //警察はテレポート
            const role = Role.get(player);
            if(role == `police`) {
                player.teleport(Position.RESPAWN);
            }
        }
    }

    
    /**
     * ゲーム終了
     */
    static finish(finishType) {
        if(Game.phase == 3)return;
        Game.phase = 3;
        Generator.removeAllShape();

        let subtitle;
        let message;
        let winPlayers = [];
        if(finishType == `police`) { 
            subtitle = `§6INISH\n§c>> 警察の勝利 <<`;
            message = `§6ドロケイ FINISH!!\n§c>> 警察の勝利 <<`;
        }
        if(finishType == `thief`) { 
            subtitle = `§6INISH\n§b>> 泥棒の勝利 <<`;
            message = `§6ドロケイ FINISH!!\n§b>> 泥棒の勝利 <<`;
            winPlayers = Role.getThiefs(Game.players).filter(p => Role.getLife(p));
        }

        system.runTimeout(() => {
            for(const player of Game.players) {
                if(!player || !player.isValid)continue;

                player.removeEffect(`slowness`);
                player.removeEffect(`blindness`);
                player.onScreenDisplay.setTitle(`§fドロケイ`, {
                    fadeInDuration:0, stayDuration:100, fadeOutDuration:20,
                    subtitle: subtitle
                });
                player.sendMessage(message + `\n§b生存者: §f${winPlayers.map(p => p.name).join(`§b, §f`)}\n\n§f30秒後にテレポートします`);
                Util.playSoundP(player, `block.end_portal.spawn`);
            }

            world.gameRules.locatorBar = true;
        }, 3);

        
        system.runTimeout(() => {
            Game.ingame = false;
            
            for(const player of Game.players) {
                if(!player || !player.isValid)continue;

                player.removeTag(`kd_play`);
                player.addTag(`kd_join`);

                Marker.set(player, 0);

                player.teleport(Position.INIT);

                Util.resetCollision(player);
            }
        }, 20 * 30);
    }


    /**
     * 強制終了
     */
    static reset() {
        Game.ingame = false;
        Generator.removeAllShape();

        for(const player of world.getPlayers().filter(p => Game.getState(p) != undefined)) {
            if(!player || !player.isValid)continue;

            player.removeTag(`kd_play`);
            player.addTag(`kd_join`);
            player.removeEffect(`resistance`);
            player.removeEffect(`saturation`);
            player.removeEffect(`slowness`);
            player.removeEffect(`blindness`);
            player.nameTag = player.name;

            Role.set(player);
            Marker.set(player, 0);

            player.sendMessage(`§c強制終了しました。`);
            player.teleport(Position.INIT);

            ExHud.sidebarShow(player);

            Util.resetCollision(player);
        }

        world.gameRules.locatorBar = true;
    }


    /**
     * 泥棒を全員発光
     */
    static glow() {
        Game.glowTime = -1;
        
        for(const player of Game.players) {
            if(!player || !player.isValid)continue;

            player.sendMessage(`§c泥棒が発光した!!`)
        }

        for(const thief of Role.getThiefs(Game.players.filter(p => Role.getLife(p) > -1))) {
            if(!thief || !thief.isValid)continue;
            Marker.set(thief, 20 * Config.GLOW_TIME);
        }

        system.runTimeout(() => {
            if(!Game.ingame)return;
            
            Game.glowTime = Config.GLOW_INTERVAL_TIME;
        }, 20 * Config.GLOW_TIME);
    }


    /**
     * 泥棒が動いていない場合は発光
     * @param {Player} player 
     */
    static movingGlow(player) {
        if(player.stayTick == undefined)player.stayTick = 0;

        //強制発光時間なら
        if(Game.glowTime == -1)return;

        const velo = player.getVelocity();
        velo.y = 0; //y軸は無視

        //移動ベクトルを長さに変換
        const len = Vector.length(velo);

         
        if(len <= 0.20) { //止まっている場合は +
            if(Config.STAY_GLOW_TIME * 20 > player.stayTick)player.stayTick += 1;
            if(Config.STAY_GLOW_TIME * 20 <= player.stayTick) {
                //発光させる
                Marker.set(player, 20);
                ExHud.actionbar(player, `§c>> 止まると発光してしまう!! <<`);

                if(system.currentTick % 20 == 0) {
                    player.onScreenDisplay.setTitle(`§c`, {
                    fadeInDuration:0, stayDuration:10, fadeOutDuration:5,
                    subtitle: `§c>> 止まると発光してしまう!! <<`
                });
                }
            }
        }else { //動いる場合は --
            if(0 < player.stayTick)player.stayTick -= 3;
            if(0 >= player.stayTick)player.stayTick = 0;
        }
        
    }
}