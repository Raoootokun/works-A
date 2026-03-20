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
        form.textField(`ポイント\nタラ §7- 49.4%%`, `ポイント`, { defaultValue:`${scores[`minecraft:cod`]}` });
        form.textField(`サケ §7- 20.0%%`, `ポイント`, { defaultValue:`${scores[`minecraft:salmon`]}` });
        form.textField(`タラ §7- 15.0%%`, `ポイント`, { defaultValue:`${scores[`minecraft:pufferfish`]}` });
        form.textField(`タラ §7- 10.0%%`, `ポイント`, { defaultValue:`${scores[`minecraft:tropical_fish`]}` });

        form.textField(`金魚 §7- 5.0%%`, `ポイント`, { defaultValue:`${scores[`fg:goldfish`]}` });
        form.textField(`黄金魚 §7- 1.0%%`, `ポイント`, { defaultValue:`${scores[`fg:golditou`]}` });
        form.textField(`イトウ §7- 0.5%%`, `ポイント`, { defaultValue:`${scores[`fg:itou`]}` });
        form.textField(`ぼにぼに §7- 0.1%%`, `ポイント`, { defaultValue:`${scores[`fg:boni`]}` });

        //時間
        form.divider();
        form.slider(`時間`, 100, 500, { defaultValue:time, valueStep:50 });
        form.show(player).then(res => {
            if(res.canceled)return;

            const fish1 = res.formValues[0]*1;
            const fish2 = res.formValues[1]*1;
            const fish3 = res.formValues[2]*1;
            const fish4 = res.formValues[3]*1;

            const fish5 = res.formValues[4]*1;
            const fish6 = res.formValues[5]*1;
            const fish7 = res.formValues[6]*1;
            const fish8 = res.formValues[7]*1;

            if(isNaN(fish1) || isNaN(fish2) || isNaN(fish3) || isNaN(fish4))return player.sendMessage(`§4ポイントは半角数字で入力してください。`);
            worldDB.set(`scores`, {
                'minecraft:cod': fish1,
                'minecraft:salmon': fish2,
                'minecraft:tropical_fish': fish3,
                'minecraft:pufferfish': fish4,

                'fg:itou': fish5,
                'fg:golditou': fish6,
                'fg:goldfish': fish7,
                'fg:boni': fish8,
            });

            const time = res.formValues[9];
            worldDB.set(`time`, time);

            player.playSound(`random.orb`);
            player.sendMessage(`[釣り大会] 設定を保存しました。`);
        });
    }
}