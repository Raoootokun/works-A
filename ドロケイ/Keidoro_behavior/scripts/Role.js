import { world, system, Player, } from "@minecraft/server";
import { WorldLoad } from "./lib/WorldLoad";
import { log, Util } from "./lib/Util"; 
import { WorldDB, PlayerDB } from "./lib/Database";


const PDB = new PlayerDB(`life`);


export class Role { 
    /**
     * 役職を取得
     */
    static get(player) {
        if(player.hasTag(`kd_police`))return `police`;
        else if(player.hasTag(`kd_thief`))return `thief`;
        else return undefined;
    }


    /**
     * 役職を設定
     */
    static set(player, role = undefined) {
        player.removeTag(`kd_police`);
        player.removeTag(`kd_thief`);

        if(role)player.addTag(`kd_${role}`);
    }


    /**
     * 警察を取得
     */
    static getPolices(players = world.getPlayers()) {
        return players.filter(p => Role.get(p) == `police`);
    }


    /**
     * 泥棒を取得
     */
    static getThiefs(players = world.getPlayers()) {
        return players.filter(p => Role.get(p) == `thief`);
    }


    /**
     * 残機を設定
     */
    static setLife(player, count) {
        PDB.set(player, `life`, count)
    }


    /**
     * 残機を取得
     */
    static getLife(player) {
        return PDB.get(player, `life`) ?? 0;
    }


    static setResistane(player, count) {
        player.resistance = count;
    }


    static getResistane(player) {
        return player.resistance ?? 0;
    }
}