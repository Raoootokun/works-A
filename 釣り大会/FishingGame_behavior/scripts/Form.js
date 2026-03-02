import { world, system, Player, } from "@minecraft/server";
import { ModalFormData, } from "@minecraft/server-ui";
import { log, Util } from "./lib/Util";
import { worldDB } from "./main";

export class Form {

    /**
     * 設定フォームを表示
     * @param {Player} player 
     */
    static showSetting(player) {
        const scores = worldDB.get(`scores`);
        const time = worldDB.get(`time`);

        const form = new ModalFormData();
        form.title(`釣り大会 設定`);
        //ポイント
        for(const fishId of Object.keys(scores)) {
            const currentValue = scores[fishId];

            form.textField(fishId, `ポイント`, { defaultValue:`${currentValue}` });
        };
        //時間
        form.slider(`時間`, 100, 500, { defaultValue:time, valueStep:50 });
        form.show(player).then(res => {
            if(res.canceled)return;

            const fish1 = res.formValues[0]*1;
            const fish2 = res.formValues[1]*1;
            const fish3 = res.formValues[2]*1;
            const fish4 = res.formValues[3]*1;

            if(isNaN(fish1) || isNaN(fish2) || isNaN(fish3) || isNaN(fish4))return player.sendMessage(`§4ポイントは半角数字で入力してください。`);
            worldDB.set(`scores`, {
                'minecraft:cod': fish1,
                'minecraft:salmon': fish2,
                'minecraft:tropical_fish': fish3,
                'minecraft:pufferfish': fish4,
            });

            const time = res.formValues[4];
            worldDB.set(`time`, time);

            player.playSound(`random.orb`);
            player.sendMessage(`[釣り大会] 設定を保存しました。`);
        });
    }
}