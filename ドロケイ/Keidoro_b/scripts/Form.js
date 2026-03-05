import { world, system, Player, ItemStack } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { WorldLoad } from "./lib/WorldLoad";
import { WorldDB, PlayerDB } from "./lib/Database";
import { log, Util } from "./lib/Util";
import { Vector } from "./lib/Vector";
import { Position } from "./Position";

import { Game } from "./Game";
import { Role } from "./Role";
import { Config } from "./Config";


export class Form {
    static giveBook(player) {
        const itemStack = new ItemStack(`minecraft:book`);
        itemStack.nameTag = `§6ドロケイ 進行ブック`;
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
        form.title(`ドロケイ`);
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
        if(players.length == 0)return player.sendMessage(`§6[ドロケイ] §c参加プレイヤーがいません。`);

        const states = [ `警察`, `泥棒` ]
        const policePlayers = Role.getPolices(players);

        const form = new ModalFormData();
        form.title(`ドロケイ 警察設定`);
        form.dropdown(`現在の警察:\n${policePlayers.map(p => `§7- ${p.name}`).join(`\n`)}\n\nプレイヤーを選択`, players.map(p => p.name));
        form.dropdown(`変更先を選択`, states);
        form.submitButton(`変更`)
        form.show(player).then(res => {
            if(res.canceled)return;

            const target = players[res.formValues[0]];
            const state = res.formValues[1];

            if(state == 0) {
                player.sendMessage(`§6[ドロケイ] §f${target.name} を 警察 に変更しました。`);

                target.sendMessage(`§c警察になりました。`);
                Role.set(target, `police`);
            }else {
                player.sendMessage(`§6[ドロケイ] §f${target.name} を 泥棒 に変更しました。`);
                
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
        form.title(`ドロケイ 設定`);
        form.slider(`TIME`, 300, 1800, { valueStep:60, defaultValue:Config.TIME, tooltip:`制限時間(s)` });
        form.slider(`POLICE_OPEN_TIME`, 15, 120, { valueStep:5, defaultValue:Config.POLICE_OPEN_TIME, tooltip:`警察開放までの時間(s)` });
        form.divider();

        form.slider(`GLOW_INTERVAL_TIME`, 60, 300, { valueStep:15, defaultValue:Config.GLOW_INTERVAL_TIME, tooltip:`プレイヤーが発光する間隔` });
        form.slider(`GLOW_TIME`, 15, 60, { valueStep:1, defaultValue:Config.GLOW_TIME, tooltip:`プレイヤーが発光する秒数(s)` });
        form.divider();

        form.slider(`STAY_GLOW_TIME`, 1, 30, { valueStep:1, defaultValue:Config.STAY_GLOW_TIME, tooltip:`プレイヤーが止まった際に発光するまで秒数(s)` });
        form.divider();

        form.slider(`GENERATOR_CHARGE`, 50, 500, { valueStep:10, defaultValue:Config.GENERATOR_CHARGE, tooltip:`電力が最大まで貯まるまでに必要なレバー操作の回数` });
        form.slider(`GENERATOR_COOLDOWN`, 0, 120, { valueStep:1, defaultValue:Config.GENERATOR_COOLDOWN, tooltip:`電力が使用可能になるまでのクールダウンの秒数(s)` });
        form.submitButton(`変更`)
        form.show(player).then(res => {
            if(res.canceled)return;

            Config.set(`TIME`, res.formValues[0]);
            Config.set(`POLICE_OPEN_TIME`, res.formValues[1]);
            Config.set(`GLOW_INTERVAL_TIME`, res.formValues[3]);
            Config.set(`GLOW_TIME`, res.formValues[4]);
            Config.set(`STAY_GLOW_TIME`, res.formValues[6]);
            Config.set(`GENERATOR_CHARGE`, res.formValues[8]);
            Config.set(`GENERATOR_COOLDOWN`, res.formValues[9]);
            Config.load();
            
            player.sendMessage(`§6[ドロケイ] §f設定を保存しました。`);
        });
    };
}

 