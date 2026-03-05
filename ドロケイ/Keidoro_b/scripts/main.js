import { world, system, } from "@minecraft/server";
import { WorldLoad } from "./lib/WorldLoad";
import { ExHud } from "./lib/ExHud";
import { log, Util } from "./lib/Util";

import "./events";
import { Game } from "./Game";
import { Role } from "./Role";
import { Marker } from "./Marker";
import { Generator } from "./Generator";
import { Armor } from "./Armor";

export const VERSION = [ 1, 1, 0 ];
WorldLoad.subscribe(ev => {
    ev.reloadLog(`§bドロケイ`, VERSION); 

    //スコアボードを作成
    if(!world.scoreboard.getObjective(`kd_info`))world.scoreboard.addObjective(`kd_info`);

    system.runInterval(() => {
        const players = world.getPlayers();
        //参加中のプレイヤー
        const playersJ = players.filter(p => Game.getState(p) == `join`);
        const policesJ = Role.getPolices(playersJ);

        //プレイ中のプレイヤー
        const playersP = players.filter(p => Game.getState(p) == `play`);
        const policesP = Role.getPolices(playersP);
        const thiefsP = Role.getThiefs(playersP);
        const aliveThiefsP = thiefsP.filter(p => Role.getLife(p) > -1);

        for(const player of players) {
            const state = Game.getState(player);

            if(state) {
                player.addEffect(`resistance`, 72000, { amplifier:10, showParticles:false });
                player.addEffect(`saturation`, 72000, { amplifier:10, showParticles:false });

                ExHud.sidebarShow(player, `kd_info`);
                ExHud.sidebarResetAll(player, `kd_info`);
                ExHud.sidebarDisplay(player, `kd_info`, `ドロケイ`);

                if(state == `join`) {
                    const role = Role.get(player);
                    if(role == `police`) {
                        player.nameTag = `§c${player.name}`;
                        Armor.attach(player);
                        ExHud.actionbar(player, `§dゲームマスター§fが開始するまでお待ちください\n§c>> あなたは警察です <<`);
                    }else {
                        player.nameTag = `§b${player.name}`;
                        Armor.detach(player);
                        ExHud.actionbar(player, `§dゲームマスター§fが開始するまでお待ちください\n§b>> あなたは泥棒です <<`);
                    }

                    ExHud.sidebarSet(player, `kd_info`, `- §b参加人数: §f${playersJ.length}§b人`, 10003, true);
                    ExHud.sidebarSet(player, `kd_info`, `- §6泥棒: §f${playersJ.length - policesJ.length}§6人`, 10002, true);
                    ExHud.sidebarSet(player, `kd_info`, `- §c警察: §f${policesJ.length}§c人`, 10001, true);
                }else if(state == `play`) {
                    const role = Role.get(player);
                    const life = Role.getLife(player);
                    if(role == `police`) { //警察
                        player.nameTag = `§c${player.name}`;
                        Armor.attach(player);

                        if(Game.phase == 1)ExHud.sidebarSet(player, `kd_info`, `- §c警察開放まで: §f${Game.time}§c秒`, 10010, true);
                        if(Game.phase == 2 || Game.phase == 3) {
                            ExHud.sidebarSet(player, `kd_info`, `- §a残り時間: §f${Game.time}§a秒`, 10010, true);
                            ExHud.sidebarSet(player, `kd_info`, `- §6泥棒: §f${aliveThiefsP.length}§6人`, 10004, true);
                            ExHud.sidebarSet(player, `kd_info`, `- §c警察: §f${policesP.length}§c人`, 10003, true);
                        }

                        ExHud.actionbar(player, `§c>> あなたは警察です <<`);
                    }
                    
                    if(role == `thief`) { //泥棒
                        player.nameTag = ``;
                        Armor.detach(player);

                        if(Game.phase == 1)ExHud.sidebarSet(player, `kd_info`, `- §c警察開放まで: §f${Game.time}§c秒`, 10010, true);
                        if(Game.phase == 2) {
                            ExHud.sidebarSet(player, `kd_info`, `- §a残り時間: §f${Game.time}§a秒`, 10010, true);
                            ExHud.sidebarSet(player, `kd_info`, `- §6泥棒: §f${aliveThiefsP.length}§6人`, 10004, true);
                            ExHud.sidebarSet(player, `kd_info`, `- §c警察: §f${policesP.length}§c人`, 10003, true);

                            //残機
                            if(life > -1) ExHud.sidebarSet(player, `kd_info`, `- §b残機: §f${life}§b`, 10002, true);
                            

                            const glow = Marker.get(player);
                            if(glow) {
                                if(glow <= 20) ExHud.sidebarSet(player, `kd_info`, `- §c発光中: §f1§c秒`, 10001, true);
                                else {
                                    ExHud.sidebarSet(player, `kd_info`, `- §c発光中: §f${Math.floor(glow / 20)}§c秒`, 10001, true);
                                    player.onScreenDisplay.setTitle(`§c`, {
                                        fadeInDuration:0, stayDuration:20, fadeOutDuration:0,
                                        subtitle: `§c>> 発光中: §f${Math.floor(glow / 20)}§c秒!! <<`
                                    });
                                }
                            }   
                            

                            //止まっていると発光
                            Game.movingGlow(player);
                        }


                        //無敵時間
                        const resistance = Role.getResistane(player);
                        if(resistance > 0) {
                            Role.setResistane(player, resistance-1);

                            player.addEffect(`invisibility`, 20 *  1, { amplifier:10, showParticles:false });
                            ExHud.sidebarSet(player, `kd_info`, `- §b無敵時間: §f${Math.floor(resistance/20)}§b秒`, 10000, true);
                        }


                        //発電機
                        ExHud.sidebarSet(player, `kd_info`, `§f`, 9999, true);
                        const geneInfo1 = Generator.getInfo(1);
                        if(geneInfo1.cooldown) ExHud.sidebarSet(player, `kd_info`, `- §v発電機-1: §c${geneInfo1.cooldown}§v秒`, 9999, true);
                        else ExHud.sidebarSet(player, `kd_info`, `- §v発電機-1: §f${geneInfo1.percent}§v%%`, 9998, true);

                        const geneInfo2 = Generator.getInfo(2);
                        if(geneInfo2.cooldown) ExHud.sidebarSet(player, `kd_info`, `- §v発電機-2: §c${geneInfo2.cooldown}§v秒`, 9999, true);
                        else ExHud.sidebarSet(player, `kd_info`, `- §v発電機-2: §f${geneInfo2.percent}§v%%`, 9997, true);


                        //水の使った場合
                        if(player.isInWater) player.addEffect(`poison`, 20 * 1, { amplifier:4, showParticles:true, });


                        ExHud.actionbar(player, `§b>> あなたは泥棒です <<`);
                    }

                    
                    //発光までの時間
                    if(Game.phase == 2 && Game.glowTime > -1) ExHud.sidebarSet(player, `kd_info`, `- §e発光まで: §f${Game.glowTime}§e秒`, 10009, true);
                }
            };

            Marker.run(player);
        }

        if(Game.ingame) {
            //発電機
            Generator.run();

            if(Game.phase == 1) {
                if(system.currentTick % 20 == 0) {
                    if(Game.time > 0) Game.time--;
                    if(Game.time == 0) Game.openPolice();
                }
            }

            if(Game.phase == 2) {
                if(system.currentTick % 20 == 0) {
                    if(Game.time > 0) Game.time--;
                    //カウントダウン
                    if(Game.time > 0 && Game.time <= 10) {
                        for(const player of Game.players) {
                            player.onScreenDisplay.setTitle(`§f`, {
                                fadeInDuration:0, stayDuration:40, fadeOutDuration:20,
                                subtitle: `§f終了まで: ${Game.time}`
                            });
                            Util.playSoundP(player, `random.click`);
                        }
                    }

                    //泥棒を発光させるw
                    if(Game.glowTime > 0) Game.glowTime--;
                    if(Game.glowTime == 0) Game.glow();

                    if(Game.time == 0) Game.finish(`thief`);
                }

                //泥棒全滅
                if(aliveThiefsP.length == 0) Game.finish(`police`);
            }
        }
        
    });
});