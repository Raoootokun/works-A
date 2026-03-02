import { world, system, Player, ItemStack } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { WorldLoad } from "./lib/WorldLoad";
import { WorldDB, PlayerDB } from "./lib/Database";
import { log, Util } from "./lib/Util";
import { Vector } from "./lib/Vector";
import { Position } from "./Position";

import { Game } from "./Game";
import { Role } from "./Role";


export class Form {
    static giveBook(player) {
        const itemStack = new ItemStack(`minecraft:book`);
        itemStack.nameTag = `§6ケイドロ 進行ブック`;
        itemStack.setLore([ `§k§d§` ])
        itemStack.lockMode = `inventory`;

        player.getComponent(`inventory`).container.addItem(itemStack);
        player.sendMessage(`§6進行ブックを入手しました`);
    };


    /**
     * @param {Player} player 
     */
    static showMain(player) {
        const form = new ActionFormData();
        form.title(`ケイドロ`);
        form.button(`座標設定`);
        form.button(`警察設定`);
        form.button(`その他設定`);
        form.button(`§9強制終了 / リセット`);
        form.button(`§c開始`);
        form.show(player).then(res => {
            if(res.canceled)return;

            if(res.selection == 0) Position.showSettingForm(player);
            if(res.selection == 1) Form.showPolice(player);
            if(res.selection == 2) Form.showSetting(player);
            if(res.selection == 3) Game.reset();
            if(res.selection == 4) Game.startCountDown(player);
        })
    };


    /**
     * @param {Player} player 
     */
    static showPolice(player) {
        const players = world.getPlayers().filter(p => Game.getState(p));
        if(players.length == 0)return player.sendMessage(`§6[ケイドロ] §c参加プレイヤーがいません。`);

        const states = [ `警察`, `泥棒` ]
        const policePlayers = Role.getPolices(players);

        const form = new ModalFormData();
        form.title(`ケイドロ 警察設定`);
        form.dropdown(`現在の警察:\n${policePlayers.map(p => `§7- ${p.name}`).join(`\n`)}\n\nプレイヤーを選択`, players.map(p => p.name));
        form.dropdown(`変更先を選択`, states);
        form.submitButton(`変更`)
        form.show(player).then(res => {
            if(res.canceled)return;

            const target = players[res.formValues[0]];
            const state = res.formValues[1];

            if(state == 0) {
                player.sendMessage(`§6[ケイドロ] §f${target.name} を 警察 に変更しました。`);

                target.sendMessage(`§c警察になりました。`);
                Role.set(target, `police`);
            }else {
                player.sendMessage(`§6[ケイドロ] §f${target.name} を 泥棒 に変更しました。`);
                
                target.sendMessage(`§b泥棒になりました。`);
                Role.set(target, `thief`);
            }
        })
    };


    /**
     * @param {Player} player 
     */
    static showSetting(player) {
        const form = new ModalFormData();
        form.title(`ケイドロ 設定`);
        form.slider(`制限時間(s)`, 300, 1800, { valueStep:60, defaultValue:1200 });
        form.slider(`発光間隔(s)`, 60, 300, { valueStep:15, defaultValue:240 });
        form.slider(`発光時間(s)`, 15, 300, { valueStep:1, defaultValue:30, tooltip:`プレイヤーが発光する秒数` });
        form.submitButton(`変更`)
        form.show(player).then(res => {
            if(res.canceled)return;

            const target = res.formValues[0]
        });
    };
}

 