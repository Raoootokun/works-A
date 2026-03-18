import { world, system, Player, CommandPermissionLevel, CustomCommandParamType, CustomCommandStatus } from "@minecraft/server";
import { WorldLoad } from "./lib/WorldLoad";
import { WorldDB, PlayerDB } from "./lib/Database";
import { log, Util } from "./lib/Util";
import { Vector } from "./lib/Vector";


export class CommonUtil {
    static checkInGame(player) {
        const inGame = CommonUtil.getInGame(player);
        if(!inGame)return false;

        if(inGame == `fg`) player.sendMessage(`§c現在、釣り大会に参加中のため、参加できません。`);
        else if(inGame == `gc`) player.sendMessage(`§c現在、お化けキャッチに参加中のため、参加できません。`);
        else if(inGame == `kd`) player.sendMessage(`§c現在、ドロケイに参加中のため、参加できません。`);
        else if(inGame == `ts`) player.sendMessage(`§c現在、瓦割りに参加中のため、参加できません。`);

        return true;
    }

    /**
     * ゲームに参加しているかどうか
     * @param {Player} player 
     */
    static getInGame(player) {
        const tags = [
            `fg_join`, `fg_play`,
            `gc_join`, `gc_play`,
            `kd_join`, `kd_play`,
            `ts_join`, `ts_play`,
        ];
        for(const tag of player.getTags()) {
            if(tags.includes(tag)) {
                return tag.replace(`_join`, ``).replace(`_play`, ``);
            }
        }

        return undefined;
    }


    /**
     * ゲームから退出
     * @param {Player} player 
     */
    static exitGame(player) {
        const inGame = CommonUtil.getInGame(player);
        if(!inGame)return player.sendMessage(`§c現在、参加しているゲームがありません。`);

        if(inGame == `fg`) player.runCommand(`function fishinggame/exit`);
        else if(inGame == `gc`) player.runCommand(`function ghostcatch/exit`);
        else if(inGame == `kd`) player.runCommand(`function keidoro/exit`);
        else if(inGame == `ts`) player.runCommand(`function tiles/exit`);
    }
}


const PREFIX = "gm";
const COMMAND_LIST = [
    { //exit
        command: {
            name: `${PREFIX}:` + "exit",
            description: "ゲームから退出します",
            permissionLevel: CommandPermissionLevel.Any,
            cheatsRequired: false,
        },
        alias: [  ],
        func: function(origin, ...args) {
            system.run(() => {
               const source = origin.sourceEntity;
                CommonUtil.exitGame(source);
            });
            return {
                status: CustomCommandStatus.Success,
            };
        }
    },
];
const ENUM_LIST = {
};


system.beforeEvents.startup.subscribe(ev => {
    for(const key of Object.keys(ENUM_LIST)) {
        const ENUM = ENUM_LIST[key];
        ev.customCommandRegistry.registerEnum(key, ENUM);
    }

    for(const DATA of COMMAND_LIST) {
        try{
            ev.customCommandRegistry.registerCommand(DATA.command, DATA.func);
        
            if(DATA?.alias?.length > 0) {
                for(const alia of DATA.alias) {
                    const commandCopy = JSON.parse(JSON.stringify(DATA.command));
                    commandCopy.name = `${PREFIX}:` + alia;

                    ev.customCommandRegistry.registerCommand(commandCopy, DATA.func);
                }
                
            }

        }catch(e){};
    }
});