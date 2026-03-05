import { world, system, Player, } from "@minecraft/server";
import { WorldLoad } from "./lib/WorldLoad";
import { WorldDB, PlayerDB } from "./lib/Database";
import { log, Util } from "./lib/Util";
import { ActionFormData } from "@minecraft/server-ui";
import { Vector } from "./lib/Vector";

const WDB = new WorldDB(`pos`);

export class Position {
    //初期リス
    static INIT;
 
    //残機ありの時の復活場所
    static RESPAWN;

    //牢屋
    static PRISON;

    //発電機
    static GENERATOR_1;
    static GENERATOR_2;


    static load() {
        Position.INIT = WDB.get(`init`);
        Position.RESPAWN = WDB.get(`respawn`);
        Position.PRISON = WDB.get(`prison`);
        Position.GENERATOR_1 = WDB.get(`generator_1`);
        Position.GENERATOR_2 = WDB.get(`generator_2`);
    };

    /**
     * @param {Player} player 
     */
    static showSettingForm(player) {
        const form = new ActionFormData();
        form.title(`ドロケイ 座標設定`);
        form.body(`登録する座標を選択してください`);
        form.button(`初期`);
        form.button(`復活`);
        form.button(`牢屋`);
        form.button(`発電機1`);
        form.button(`発電機2`);
        form.show(player).then(res => {
            if(res.canceled)return;
            const pos = Vector.add(Vector.floor(player.location), { x:0.5, y:0, z:0.5 });

            if(res.selection == 0) {
                WDB.set(`init`, pos)
                Position.INIT = pos;
                player.sendMessage(`§6[ドロケイ] §f初期座標を ${pos.x}, ${pos.y}, ${pos.z} に登録しました`);
            }
            if(res.selection == 1) {
                WDB.set(`respawn`, pos)
                Position.RESPAWN = pos;
                player.sendMessage(`§6[ドロケイ] §f復活座標を ${pos.x}, ${pos.y}, ${pos.z} に登録しました`);
            }
            if(res.selection == 2) {
                WDB.set(`prison`, pos)
                Position.PRISON = pos;
                player.sendMessage(`§6[ドロケイ] §f牢屋座標を ${pos.x}, ${pos.y}, ${pos.z} に登録しました`);
            }
            if(res.selection == 3) {
                WDB.set(`generator_1`, pos)
                Position.GENERATOR_1 = pos;
                player.sendMessage(`§6[ドロケイ] §f発電機1を ${pos.x}, ${pos.y}, ${pos.z} に登録しました`);
            }
            if(res.selection == 4) {
                WDB.set(`generator_2`, pos)
                Position.GENERATOR_2 = pos;
                player.sendMessage(`§6[ドロケイ] §f発電機2を ${pos.x}, ${pos.y}, ${pos.z} に登録しました`);
            }
        })
    }
}


WorldLoad.subscribe(() => {
    Position.load();
});