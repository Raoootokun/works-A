import { world, system, Player, ItemStack, } from "@minecraft/server";
import { log, Util } from "./lib/Util";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { Game } from "./Game";

export class Form {
    static giveBook(player) {
        const itemStack = new ItemStack(`minecraft:book`);
        itemStack.nameTag = `§6お化けキャッチ 進行ブック`;
        itemStack.setLore([ `§g§c§` ])
        itemStack.lockMode = `inventory`;

        player.getComponent(`inventory`).container.addItem(itemStack);
        player.sendMessage(`§6進行ブックを入手しました`);
    };


    /**
     * メインフォームを表示
     * @param {Player} player 
     */
    static showMain(player) {
        const form = new ActionFormData();
        form.title(`お化けキャッチ`);
        form.button(`§9リセット / 強制終了`);
        form.button(`§c開始`);
        form.button(`透明化 / 透明解除`);
        form.button(`ネームタグを表示 / 非表示`);
        form.button(`§6テスト用\nお題作成 & 設置`);
        // form.button(`§f設定`);
        form.show(player).then(res => {
            if(res.selection == 0) Game.reset();
            if(res.selection == 1) Game.start(player);
            if(res.selection == 2) Game.setIsInvisible(player);
            if(res.selection == 3) Game.setIsShownametag(player);
            if(res.selection == 4) Game.setTest(player);
        });
    }


    static showSetting(player) {
        const form = new ModalFormData();
        form.title(`お化けキャッチ`);
        form.slider(`ターン数`, 1, 12, { defaultValue:7, valueStep:1 });
        form.slider(`\nポイント\n\n1位`, 0, 300, { defaultValue:150, valueStep:10 });
        form.slider(`2位`, 0, 300, { defaultValue:100, valueStep:10 });
        form.slider(`3位`, 0, 300, { defaultValue:80, valueStep:10 });
        form.slider(`4位`, 0, 300, { defaultValue:70, valueStep:10 });
        form.slider(`5位`, 0, 300, { defaultValue:50, valueStep:10 });
        form.slider(`6位`, 0, 300, { defaultValue:40, valueStep:10 });
        form.slider(`7位`, 0, 300, { defaultValue:10, valueStep:10 });
        form.slider(`8位`, 0, 300, { defaultValue:0, valueStep:10 });
        form.submitButton(`保存`);
        form.show(player).then(res => {
            if(res.canceled)return;
        })

    }

}