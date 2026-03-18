import { world, system, Player, } from "@minecraft/server";
import { WorldLoad } from "./lib/WorldLoad";
import { log, Util } from "./lib/Util"; 
import { WorldDB, PlayerDB } from "./lib/Database";


const WDB = new WorldDB(`kd`);


export class Config {
    static TIME = 1200; //制限時間
    static POLICE_OPEN_TIME = 30;
    static GLOW_INTERVAL_TIME = 200;
    static GLOW_TIME = 40;
    static STAY_GLOW_TIME = 5;
    static GENERATOR_CHARGE = 5;
    static GENERATOR_COOLDOWN = 60;
    static GLOW_SHAPE = true;
    static GENERATOR_SHAPE = true;


    static load() {
        Config.TIME = WDB.get(`TIME`) ?? 1200;
        Config.POLICE_OPEN_TIME = WDB.get(`POLICE_OPEN_TIME`) ?? 30;
        Config.GLOW_INTERVAL_TIME = WDB.get(`GLOW_INTERVAL_TIME`) ?? 200;
        Config.GLOW_TIME = WDB.get(`GLOW_TIME`) ?? 40;
        Config.STAY_GLOW_TIME = WDB.get(`STAY_GLOW_TIME`) ?? 5;
        Config.GENERATOR_CHARGE = WDB.get(`GENERATOR_CHARGE`) ?? 300;
        Config.GENERATOR_COOLDOWN = WDB.get(`GENERATOR_COOLDOWN`) ?? 60;
        Config.GLOW_SHAPE = WDB.get(`GLOW_SHAPE`) ?? true;
        Config.GENERATOR_SHAPE = WDB.get(`GENERATOR_SHAPE`) ?? true;
    }

    static set(key, value) {
        WDB.set(key, value);
    }
}


WorldLoad.subscribe(() => {
    Config.load();
});