import { world, system, } from "@minecraft/server";
import { WorldLoad } from "./lib/WorldLoad"
import { log } from "./lib/Util";
import { WorldDB, PlayerDB } from "./lib/Database";
import { ExHud } from "./lib/ExHud";

export const worldDB = new WorldDB(`fg`);
export const playerDB = new PlayerDB(`fg`);

import "./events";

import { Shape } from "./Shape";
import { Stamprally } from "./Stamprally";

const VERSION = [ 0, 1, 0 ];
WorldLoad.subscribe(ev => {
    ev.reloadLog("§bスタンプラリー", VERSION);

    //スコアボードの作成
    let objective = world.scoreboard.getObjective(`sr_count`);
    if(!objective)objective = world.scoreboard.addObjective(`sr_count`);

    system.runInterval(() => {
        Stamprally.run(objective);
        Shape.run();
    });
});

//-3.7487