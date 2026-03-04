import { world, system, Player, Dimension, BlockVolume, } from "@minecraft/server";
import { ExHud } from "./lib/ExHud";
import { Position } from "./Position";
import { WorldLoad } from "./lib/WorldLoad";
import { Struct } from "./Struct";
import { log, Util } from "./lib/Util";
import { Floor } from "./Floor";
import { CommonUtil } from "./CommonUtil";
import { Vector } from "./lib/Vector";


const POINT = {
    1: 150,
    2: 100,
    3: 80,
    4: 70,
    5: 50,
    6: 30,
    7: 10,
}
const MAX_TURN = 7;

/** @type {Dimension} */ let overworld;
WorldLoad.subscribe(ev => {
    overworld = world.getDimension(`overworld`);
});


export class Game {
    static ingame = false;
    static phase = `none`;
    static turn = 0;
    /** @type {Player[]} */ static players = [];
    /** @type {Player} */ static gameMaster;
    /** @type {{ player:Player, index:number }[]} */ static goals;
    /** @type {Player[]} */ static outs;
    /** @type {boolean} */ static isInvisible = false;
    /** @type {boolean} */ static isShowNametag = true;



    /**
     * プレイヤーを参加状態にします 
     * @param {Player} player 
     */
    static join(player) {
        //ゲームが進行中かどうか
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

        //タグ
        player.removeTag(`gc_play`);
        player.addTag(`gc_join`);

        player.sendMessage(`お化けキャッチに参加しました。\n§dゲームマスター§fが開始するまでお待ちください。`);
        player.teleport(Position.CENTER);
    }


    /**
     * プレイヤーを非参加状態にします 
     * @param {Player} player 
     */
    static exit(player) {
        //ゲームが進行中かどうか
        if(Game.ingame)return player.sendMessage(`§c現在ゲームが進行中のため、退出することはできません。`);

        //タグ
        player.removeTag(`gc_play`);
        player.removeTag(`gc_join`);

        player.nameTag = player.name;
        player.removeEffect(`resistance`);
        player.removeEffect(`saturation`);
        player.removeEffect(`weakness`);

        player.sendMessage(`お化けキャッチから退出しました。`);
        player.teleport(Position.EXIT);

        ExHud.sidebarShow(player);
    }


    /**
     * ワールド参加じに途中参加かどうかを判別します
     * @param {Player} player 
     */
    static load(player) {
        //参加タグがあるかどうか
        if(!Game.getState(player))return;

        //ゲームが進行中かどうか
        if(!Game.ingame)return Game.exit(player);

        //参加タグあり、ゲーム進行中の場合
        //強制終了させる

        player.removeTag(`gc_play`);
        player.removeEffect(`resistance`);
        player.removeEffect(`saturation`);
        player.removeEffect(`weakness`);
        player.sendMessage(`§cゲーム進行中に退出したため、強制終了となりました。`);
    }


    static getState(player) {
        const tag = player.getTags().find(t => t.startsWith(`gc_`));
        if(tag)return tag.replace(`gc_`, ``);
        return undefined;
    }


    /**
     * ゲーム開始
     * @param {Player} gameMaster 
     */
    static start(gameMaster) {
        //ゲームが進行中の場合
        if(Game.ingame)return gameMaster.sendMessage(`§6[お化けキャッチ] §c現在ゲームを進行中です`);

        //参加プレイヤーを取得
        Game.players = world.getPlayers({ tags:[ `gc_join` ] });
        //参加プレイヤーが2人以上いない場合
        if(Game.players.length < 1)return gameMaster.sendMessage(`§6[お化けキャッチ] §c参加人数が足りません(現在: ${Game.players.length}人、必要: 1人以上)`);

        Game.ingame = true;
        Game.gameMaster = gameMaster;
        Game.phase = `none`;
        Game.turn = 0;

        //スコアボードをリセット
        const objective = world.scoreboard.getObjective(`gc_score`);
        for(const scoreInfo of objective.getParticipants()) {
            objective.removeParticipant(scoreInfo);
        }

        for(const player of Game.players) {
            if(!player || !player.isValid)continue;
            
            player.onScreenDisplay.setTitle(`お化けキャッチ`, {
                fadeInDuration:0, stayDuration:100, fadeOutDuration:20,
                subtitle: `§cSTART`
            });
            player.sendMessage(`§6お化けキャッチ START!!`);
            player.playSound(`random.levelup`, { pitch:0.8 });

            //参加プレイヤーのみに実行
            if(Game.getState(player) == `join`) {
                //タグ
                player.addTag(`gc_play`);
                player.removeTag(`gc_join`);

                //スコアを初期化
                world.scoreboard.getObjective(`gc_score`).setScore(player, 0);
            }
        };

        system.runTimeout(() => { Game.startWaitPhase(); }, 20 * 3);
    }


    /**
     * Waitフェーズ開始
     */
    static startWaitPhase() {
        if(!Game.ingame) return;
        if(Game.turn == MAX_TURN) return Game.finish();

        Game.phase = `wait`;
        Game.turn += 1;

        //壁を設置
        const overworld = world.getDimension(`overworld`);
        overworld.fillBlocks(new BlockVolume(Position.WALL.from, Position.WALL.to), `glass`);

        
        
        //ステージをリセット
        const from = Vector.add(Position.STAGE.center, { x:-4, y:0, z:-10 });
        const to = Vector.add(Position.STAGE.center, { x:4, y:11, z:10 });
        overworld.fillBlocks(new BlockVolume(from, to), `air`, { blockFilter:{ excludeTypes:[`minecraft:soul_lantern`] } });

        //ステージにテレポート
        for(const player of Game.players) {
            if(!player || !player.isValid)continue;
            
            player.onScreenDisplay.setTitle(`§1`, {
                fadeInDuration:0, stayDuration:100, fadeOutDuration:20,
                subtitle: `§b[ターン: ${Game.turn}/${MAX_TURN}]`
            });
            player.teleport(Position.CENTER, { rotation:{ x:0, y:90 } });
            player.sendMessage(`§b[ターン: ${Game.turn}/${MAX_TURN}]`);
            player.playSound(`note.harp`, { pitch:0.5 });
        }

        let cnt = 3;
        const systemNum = system.runInterval(() => {
            if(!Game.ingame) return system.clearRun(systemNum);
            
            if(cnt == 0) {
                //thinkに移行
                Game.startThinkPhase();
                return system.clearRun(systemNum);
            };

            for(const player of Game.players) {
                if(!player || !player.isValid)continue;
                
                player.onScreenDisplay.setTitle(`§f${cnt}`, {
                    fadeInDuration:0, stayDuration:40, fadeOutDuration:20,
                });
                player.playSound(`note.harp`, { pitch:0.5 });
            };

            cnt--;
        }, 40);
    }


    /**
     * Thinkフェーズ開始
     */
    static startThinkPhase() {
        if(!Game.ingame)return;

        Game.phase = `think`;
        Game.goals = [];
        Game.outs = [];

        //像を決定、設置
        const info = Struct.set();
        const volumeInfo = Struct.getVolumeInfo(info.answerId);

        //床を配置
        Floor.airAll();
        Floor.set(info.answerId);

        //壁を削除
        overworld.fillBlocks(new BlockVolume(Position.WALL.from, Position.WALL.to), `air`);

        for(const player of Game.players) {
            if(!player || !player.isValid)continue;

            player.onScreenDisplay.setTitle(`§fGO!`, {
                fadeInDuration:0, stayDuration:100, fadeOutDuration:20,
            });
            player.playSound(`random.explode`);
        };
        
        const systemNum = system.runInterval(() => {
            if(!Game.ingame)return system.clearRun(systemNum);

            const goalIds = Game.goals.map(d => d.player.id);
            const outIds = Game.outs.map(p => p.id);

            for(const player of Game.players) {
                if(volumeInfo.asnwerVolume.isInside(player.location)) { //正解の穴に入った場合

                    //ゴールリストに入っているか
                    if(goalIds.includes(player.id) || outIds.includes(player.id))continue;

                    //ゴール
                    Game.goal(player);

                }else { //不正解の穴に入った場合
                    for(const noVolume of volumeInfo.noVolumes) {
                        if(!noVolume.isInside(player.location))continue;

                        //脱落リストに入っているか
                        if(outIds.includes(player.id) || goalIds.includes(player.id))continue;

                        //脱落
                        Game.out(player);
                    }
                }
            }

            //全プレイヤーがゴールor脱落したら
            if(Game.players.length == Game.goals.length + Game.outs.length) {
                system.runTimeout(() => { Game.startWaitPhase() }, 100);
                return system.clearRun(systemNum);
            }
        });
    }


    /**
     * 終了
     */
    static async finish() {
        if(!Game.ingame)return;
        Game.ingame = false;

        Floor.setAll();

        const results = [];

        for(const player of Game.players) {
            if(!player || !player.isValid)continue;

            player.onScreenDisplay.setTitle(`お化けキャッチ`, {
                fadeInDuration:0, stayDuration:100, fadeOutDuration:20,
                subtitle: `§cFINISH`
            });
            player.sendMessage(`§6お化けキャッチ FINISH!!`);
            player.teleport(Position.CENTER);
            Util.playSoundP(player, `block.end_portal.spawn`, { delay:3 });

            const point = world.scoreboard.getObjective(`gc_score`).getScore(player);
            results.push({ player:player, point:point, index:0 });
        }


        await system.waitTicks(20 * 3);

        //ポイント順に並び替え
        results.sort((a, b) => b.point - a.point);

        //順位を取得
        let oldIndex = 0;
        let oldPoint = 0;
        for(const data of results) {
            //同点の場合
            if(oldPoint == data.point)data.index = oldIndex;
            else data.index += 1 + oldIndex;

            oldIndex = data.index;
            oldPoint = data.point;

            if(data.index == 1)data.index = `§e1`;
            if(data.index == 2)data.index = `§h2`;
            if(data.index == 3)data.index = `§n3`;
        };

        for(const { player, index } of results) {
            player.onScreenDisplay.setTitle(`§1`, {
                fadeInDuration:0, stayDuration:100, fadeOutDuration:20,
                subtitle:`あなたは ${index}位 §fでした`
            });
            player.playSound(`random.levelup`, { pitch:0.5 });

            //参加状態にする
            player.removeTag(`gc_play`);
            player.addTag(`gc_join`);
        }

        const resMsg = results.map(d => `${d.index}位: ${d.player.name} §f[§l§6${d.point}§r§f]`).join(`\n`);
        Game.sendMessage(`\n===== 結果 =====\n${resMsg}\n==============`);
    }


    /**
     * 強制終了
     */
    static reset() {
        Game.ingame = false;

        Floor.setAll();

        for(const player of world.getPlayers().filter(p => Game.getState(p) != undefined)) {
            if(!player || !player.isValid)continue;

            player.removeTag(`gc_play`);
            player.addTag(`gc_join`);

            player.sendMessage(`§c強制終了しました。`);
            player.teleport(Position.CENTER);

            ExHud.sidebarShow(player);
        }
    }


    /**
     * ゴール
     */
    static goal(player) {
        const index = Game.goals.length + 1;

        //ポイント付与
        let point = 0;
        if(index < 8)point = POINT[index];
        //後半の場合 point 二倍
        if(Game.turn > Math.round(MAX_TURN / 2))point *= 2;
        
        world.scoreboard.getObjective(`gc_score`).addScore(player, point);

        Game.goals.push({ player:player, index:index });
        Game.sendMessage(`§f${index}位: ${player.name}`);  
        player.onScreenDisplay.setTitle(`§e>> 正解 <<`, {
            fadeInDuration:0, stayDuration:60, fadeOutDuration:20,
            subtitle:`${(Game.turn > Math.round(MAX_TURN / 2)) ? `§6+${point}` : `§f+${point}`  }`
        });
        Util.playSoundP(player, `random.levelup`, { pitch:1.2, count:5 });
    }


    /**
     * 脱落
     * @param {Player} player 
     */
    static out(player) {
        Game.outs.push(player);
        Game.sendMessage(`§c脱落: ${player.name}`);
        player.onScreenDisplay.setTitle(`§c>> 脱落 <<`, {
            fadeInDuration:0, stayDuration:60, fadeOutDuration:20,
        });
        Util.playSoundP(player, `mob.evocation_illager.prepare_summon`, { count:2, pitch:1.2 });

        system.runTimeout(() => {
            player.teleport(Position.DIE);
            player.extinguishFire();
        }, 20 * 2);
    }

    static sendMessage(message) {
        for(const player of Game.players) {
            player.sendMessage(message);
        };
    }

    static setTest(player) {
        

        //像を決定、設置
        const info = Struct.set();
        const volumeInfo = Struct.getVolumeInfo(info.answerId);

        player.sendMessage(`§6[お化けキャッチ] §f像を設置\n正解Id: ${info.answerId}\nType: ${info.type}`)
    }

    static setIsInvisible(player) {
        const nextBool = !Game.isInvisible;

        Game.isInvisible = nextBool;
        player.sendMessage(`§6[お化けキャッチ] プレイヤーの透明化を ${nextBool} に変更しました。`);
    }

    static setIsShownametag(player) {
        const nextBool = !Game.isShowNametag;

        Game.isShowNametag = nextBool;
        player.sendMessage(`§6[お化けキャッチ] プレイヤーのネームタグ表示を ${nextBool} に変更しました。`);
    }
}