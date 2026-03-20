import { world, system, } from "@minecraft/server";
import { WorldLoad } from "./lib/WorldLoad"
import { log } from "./lib/Util";
import { WorldDB, PlayerDB } from "./lib/Database";
import { ExHud } from "./ExHud";

import "./events";
import { GameSystem } from "./GameSystem";
import { Score } from "./Score";

export const worldDB = new WorldDB(`fg`);
export const playerDB = new PlayerDB(`fg`);

const VERSION = [ 1, 0, 0 ];
WorldLoad.subscribe(ev => {
    ev.reloadLog("§b釣り大会", VERSION);

    system.runInterval(() => { 
        for(const player of world.getPlayers()) {
            const state = GameSystem.getState(player);

            if(state) {
                ExHud.sidebarShow(player, `fg_point`);
                ExHud.sidebarRefSetAll(player, `fg_point`);

                if(state == `fg_join`) {
                    ExHud.sidebarDisplay(player, `fg_point`, `釣り結果`);
                };

                if(state == `fg_play`) {
                    ExHud.sidebarDisplay(player, `fg_point`, `釣り中`);
                    ExHud.actionbar(player, `残り時間:§b${player.time}§f秒  現在の得点:§c${Score.get(player)}§f`, 20);

                    GameSystem.loop(player);
                };
            };
            

            
        };
    }, 20);

    //Reload時の処理
    for(const player of world.getPlayers()) {
        GameSystem.check(player);
    }
});