import { world, system, } from "@minecraft/server";
import { WorldLoad } from "./lib/WorldLoad";
import { log, Util } from "./lib/Util";

import "./events";

import { Game } from "./Game";
import { ExHud } from "./lib/ExHud";

const VERSION = [ 1, 0, 0 ];
WorldLoad.subscribe(ev => {
    ev.reloadLog("§bお化けキャッチ", VERSION);

    //スコアボードを作成
    if(!world.scoreboard.getObjective(`gc_score`))world.scoreboard.addObjective(`gc_score`);

    system.runInterval(() => {
        const players = world.getPlayers();
        const joinPlayers = players.filter(p => Game.getState(p) == `join`);

        for(const player of players) {
            const state = Game.getState(player);

            if(state) {
                player.addEffect(`resistance`, 72000, { amplifier:10, showParticles:false });
                player.addEffect(`saturation`, 72000, { amplifier:10, showParticles:false });
                player.addEffect(`weakness`, 72000, { amplifier:10, showParticles:false });

                ExHud.sidebarShow(player, `gc_score`);
                ExHud.sidebarResetAll(player, `gc_score`);
                ExHud.sidebarDisplay(player, `gc_score`, `お化けキャッチ`);

                if(state == `join`) {
                    ExHud.sidebarSet(player, `gc_score`, `- §b参加人数: §f${joinPlayers.length}§b人`, 10003, true);
                    ExHud.sidebarSet(player, `gc_score`, `- §b透明化: §f${Game.isInvisible}`, 10002, true);
                    ExHud.sidebarSet(player, `gc_score`, `- §bネームタグ表示: §f${Game.isShowNametag}`, 10001, true);

                    ExHud.actionbar(player, `§dゲームマスター§fが開始するまでお待ちください`);
                }else if(state == `play`) {
                    ExHud.sidebarRefSetAll(player, `gc_score`);
                    ExHud.actionbar(player, `§f正解の像のところへ走れ!`);

                    //透明化
                    if(Game.isInvisible) player.addEffect(`invisibility`, 200, { showParticles:false });
                    else player.removeEffect(`invisibility`);

                    //ネームタグの非表示
                    if(Game.isShowNametag) player.nameTag = player.name;
                    else player.nameTag = ``;
                }
            };
            
        };

    }); 
});
