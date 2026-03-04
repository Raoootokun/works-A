import { world, system, Player, } from "@minecraft/server";
import { WorldLoad } from "./lib/WorldLoad";
import { log, Util } from "./lib/Util"; 
import { WorldDB, PlayerDB } from "./lib/Database";
import { Vector } from "./lib/Vector";


const PDB = new PlayerDB(`glow`);


export class Marker { 
    static run(player) {
        const tick = Marker.get(player);
        if(tick > 0) {
            Marker.set(player, tick-1);
          
            player.setProperty(`property:marker`, true);
        }else {
            player.setProperty(`property:marker`, false);
        }
    }


    /**
     * 取得
     */
    static get(player) {
        return PDB.get(player, `glow`) ?? 0;
    }


    /**
     * 取得
     */
    static set(player, tick) {
        PDB.set(player, `glow`, tick);
    }
}