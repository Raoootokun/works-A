import { world, system, ItemStack, Player, Block, } from "@minecraft/server";
import { ActionFormData, MessageFormData, ModalFormData } from "@minecraft/server-ui";
import { WorldLoad } from "./lib/WorldLoad"
import { log } from "./lib/Util";
import { playerDB, worldDB } from "./main";

import { Vector } from "./lib/Vector";
import { Stamprally } from "./Stamprally";


export class CheckPoint {
    static getList() {
        const list = worldDB.get(`checkPointList`) ?? {};
        if(Object.keys(list).length == 0) for(let i=1; i<=Stamprally.MAX_STAMP_COUNT; i++) {
            list[i] = {
                pos: null,
                text: null,
                description: null,
            };
        };

        return list;
    }

    /**
     * チェックポイントを登録
     */
    static bind(player, block) {
        const list = CheckPoint.getList();
        const pos = block.location;
        
        //登録済みかどうか
        let warnTx = ``;
        for(const numberKey of Object.keys(list)) {
            const data = list[numberKey];
            //未登録
            if(!data.pos)continue;
            if(Vector.distance(pos, data.pos) == 0)warnTx = `§cこの座標はすでに[§f§l${numberKey}§r§c]が登録済みです!\n§c登録ボタンを押すと上書きされます!§r§f\n\n`;
        };

        const form = new ModalFormData();
        form.title(`スタンプラリー チェックポイント登録`);
        form.slider(`${warnTx}数値`, 1, Stamprally.MAX_STAMP_COUNT);
        form.textField(`タイトル`, 'Text', { tooltip:`ロードマップに表示するタイトル\n§e※必ず入力してください` });
        form.textField(`説明`, `Text`, { tooltip:`ロードマップに表示する説明文\n§a※未入力でもOK!` });
        form.submitButton(`登録`);
        form.show(player).then(res => {
            if(res.canceled)return;

            const number = res.formValues[0];
            const title = res.formValues[1];
            const description = res.formValues[2];
            if(title == undefined)return player.sendMessage(`§cタイトルを入力してください`);

            list[number] =  {
                pos: pos,
                title: title,
                description: description,
            }
            worldDB.set(`checkPointList`, list);

            player.sendMessage(`§6[スタンプラリー] §fチェックポイント[§b${title} / ${number}§f]を登録しました(§7${pos.x}§f, §7${pos.y}§f, §7${pos.z}§f)`);
        });
    }

    /**
     * チェックポイントを解除
     */
    static unbind(player, block) {
        const list = CheckPoint.getList();
        const pos = block.location;

        //登録済みかどうか
        let number;
        let data;
        let isBind = false;
        for(const numberKey of Object.keys(list)) {
            const data_ = list[numberKey];
            //未登録
            if(!data_.pos)continue;

            if(Vector.distance(pos, data_.pos) == 0) {
                number = numberKey;
                data = data_;
                isBind = true;
                break;
            };
        };
        if(!isBind)return player.sendMessage(`§cこの座標は登録されていません`);


        const form = new MessageFormData();
        form.title(`スタンプラリー チェックポイント解除`);
        form.body(`§7登録情報: §f[§l${data.title}/${number}§r§f] §7(${pos.x}, ${pos.y}, ${pos.z})`);
        form.button1(`§c解除`);
        form.button2(`閉じる`);
        form.show(player).then(res => {
            if(res.canceled)return;
            if(res.selection == 1)return

            list[number] = {
                pos: null,
                text: null,
                discription: null,
            };
            worldDB.set(`checkPointList`, list);

            player.sendMessage(`§6[スタンプラリー] §fチェックポイント[§b${data.title} / ${number}§f]を解除しました(§7${pos.x}§f, §7${pos.y}§f, §7${pos.z}§f)`);
        });
    }

    /**
     * チェックポイントの表示
     */
    static showList(player) {
        const list = CheckPoint.getList();

        let tx = ``;
        for(const number of Object.keys(list)) {
            const data = list[number];
            
            if(data.pos) tx += `§f[§l${data.title} / ${number}§r§f]: §7(${data.pos.x}, ${data.pos.y}, ${data.pos.z})\n`;
            else tx += `§f[§l--- / ${number}§r§f]: §7未登録\n`;
        }
        tx += `\n\n`

        const form = new ActionFormData();
        form.title(`スタンプラリー チェックポイント一覧`);
        form.body(tx);
        form.button(`すべて削除する`);
        form.button(`閉じる`);
        form.show(player).then(res => {
            if(res.canceled)return;
            if(res.selection == 0) {
                worldDB.set(`checkPointList`, {});
                player.sendMessage(`§6[スタンプラリー]§f チェックポイントをすべて削除しました`);
            }
        });
    }

    /**
     * 座標からチェックポイントのナンバーを取得
     * @param {Block} block 
     * @returns {number}
     */
    static getNumber(block) {
        const list = CheckPoint.getList();
        for(const number of Object.keys(list)) {
            const data = list[number];

            //未同録の場合
            if(!data.pos)continue;

            //登録済みの座標と一致した場合
            if(Vector.distance(block.location, data.pos) == 0)return number;
        };

        return 0;
    }


    /**
     * スタンプを押したチェックポイントを取得
     * @param {Player} player 
     * @returns {[]}
     */
    static getCheckedList(player) {
        return playerDB.get(player, `checkedPointList`) ?? [];
    };

    /**
     * チェックポイントにナンバーを追加
     * @param {Player} player 
     * @param {number} number 
     */
    static addCheckedList(player, number) {
        const list = CheckPoint.getCheckedList(player);
        list.push(number);
        playerDB.set(player, `checkedPointList`, list);

        const checkedStampCount = player.getProperty(`property:checked_stamp_count`);
        player.setProperty(`property:checked_stamp_count`, checkedStampCount+1);
    }
}