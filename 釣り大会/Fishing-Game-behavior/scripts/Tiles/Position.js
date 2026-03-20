import { world, system, Player, } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { WorldLoad } from "../lib/WorldLoad";
import { Vector } from "../lib/Vector";
import { WorldDB } from "../lib/Database";


const WDB = new WorldDB(`tiles`);


export class TilesPosition {
    static INIT;


    static load() {
        TilesPosition.INIT = WDB.get(`init`);
    };

    /**
     * @param {Player} player 
     */
    static showSettingForm(player) {
        const form = new ActionFormData();
        form.title(`瓦割り 座標設定`);
        form.body(`登録する座標を選択してください`);
        form.button(`初期`);
        form.show(player).then(res => {
            if(res.canceled)return;
            const pos = Vector.add(Vector.floor(player.location), { x:0.5, y:0, z:0.5 });

            if(res.selection == 0) {
                WDB.set(`init`, pos)
                TilesPosition.INIT = pos;
                player.sendMessage(`§6[ケイドロ] §f初期座標を ${pos.x}, ${pos.y}, ${pos.z} に登録しました`);
            };
        })
    }
}


WorldLoad.subscribe(() => {
    TilesPosition.load();
});