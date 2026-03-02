import { world, system, ItemStack, Player, ScoreboardObjective, } from "@minecraft/server";
import { WorldLoad } from "./lib/WorldLoad"
import { log } from "./lib/Util";
import { playerDB, worldDB } from "./main";
import { ActionFormData, MessageFormData, ModalFormData } from "@minecraft/server-ui";
import { Vector } from "./lib/Vector";
import { CheckPoint } from "./CheckPoint";



export class Stamprally {
    static MAX_STAMP_COUNT = 13;
    static STAMPBOARD_ITEM_ID_1 = `sr:board_1`;
    static STAMPBOARD_ITEM_ID_2 = `sr:board_2`;
    static TOOL_ITEM_ID = `minecraft:stick`;

 

    /**
     * 
     * @param {ScoreboardObjective} objective 
     */
    static run(objective) {
        for(const player of world.getPlayers()) {
            //ラグ防止のため 20tick毎に実行
            if(system.currentTick % 20 == 0) {
                //スタンプを押している回数を取得
                const checkedStampCount = player.getProperty(`property:checked_stamp_count`);
                objective.setScore(player, checkedStampCount);

                //タグを付与
                const checkedList = CheckPoint.getCheckedList(player);
                for(let i=1; i<=Stamprally.MAX_STAMP_COUNT; i++) {
                    const number = `${i}`;
                    const checked = checkedList.includes(number);

                    if(checked) {
                        if(!player.hasTag(`sr_stamp_${number}`))player.addTag(`sr_stamp_${number}`);
                    }else {
                        if(player.hasTag(`sr_stamp_${number}`))player.removeTag(`sr_stamp_${number}`);
                    }
                }

                const itemStack = player.getComponent(`inventory`).container.getItem(player.selectedSlotIndex);
                const mapNumber = Stamprally.getMapNumberForItem(itemStack);
                if(mapNumber) {
                    let maxStampCount;
                    if(mapNumber == 1)maxStampCount = 8;
                    if(mapNumber == 2)maxStampCount = 6;

                    if(checkedStampCount == maxStampCount)player.setProperty(`property:stamp_max_pressed`, true);
                    else player.setProperty(`property:stamp_max_pressed`, false);
                }
            };

            //角度調節
            const x = player.getRotation().x;
            player.setProperty(`property:rotation`, getY(x));

            
        }
    }

    /**
     * ツールを付与
     * @param {Player} player 
     */
    static addTool(player) {
        const itemStack = new ItemStack(Stamprally.TOOL_ITEM_ID, 64);
        itemStack.nameTag = `§6スタンプラリー 設定ツール`;
        itemStack.setLore([
            `§t§o§o§l`,
            `§r§f使い方`,
            `§r§7----------`,
            `§r§7[ブロックに右クリック] §f像の登録`,
            `§r§7[ブロックに左クリック] §f像の登録解除`,
        ]);

        const container = player.getComponent(`inventory`).container;
        container.addItem(itemStack);
        player.sendMessage(`§6スタンプラリー用の設定ツールを入手しました`);
    }

    /**
     * ツールかどうか
     * @param {ItemStack} itemStack 
     * @returns 
     */
    static isTool(itemStack) {
        return itemStack ? itemStack.getLore().includes(`§t§o§o§l`) : false;
    }


    /**
     * ボードを付与
     * @param {Player} player 
     * @param {number} mapNumber 
     */
    static addBoard(player, mapNumber) {
        const itemStack = new ItemStack(Stamprally[`STAMPBOARD_ITEM_ID_${mapNumber}`], 1);
        itemStack.nameTag = `§6スタンプラリー`;
        itemStack.setLore([
            `§b§o§a§r§d`,
            `§r§fチェックポイントにインタラクトすることでスタンプを押せるよ!`,
            `§r§fしゃがみながらインタラクトすることでロードマップを表示できるよ!`,
        ]);

        const container = player.getComponent(`inventory`).container;
        container.addItem(itemStack);
    }

    /**
     * ボードかどうか
     * @param {ItemStack} itemStack 
     * @returns 
     */
    static isBoard(itemStack) {
        return itemStack ? itemStack.getLore().includes(`§b§o§a§r§d`) : false;
    }


    /**
     * スタンプを押す
     * @param {Player} player 
     * @param {number} number 
     * @returns 
     */
    static pressStamp(player, number) {
        //チェックポイントですでにスタンプを押しているか
        const checkedList = CheckPoint.getCheckedList(player);
        if(checkedList.includes(number)) { //すでに押している場合
            player.onScreenDisplay.setTitle(`§1`, {
                fadeInDuration:0, stayDuration:60, fadeOutDuration:20, subtitle:`§cもう押してるよ!`
            });
            player.playSound(`note.bass`);
        }else {
            player.onScreenDisplay.setTitle(`§1`, {
                fadeInDuration:0, stayDuration:60, fadeOutDuration:20, subtitle:`§a§lスタンプ ヨシッ!`
            });
            player.playSound(`random.explode`, { volume:0.5, pitch:8 });

            CheckPoint.addCheckedList(player, number);
        }

    }

    /**
     * スタンプボードの記録をリセットする
     * @param {Player} player 
     */
    static reset(player) {  
        playerDB.set(player, `checkedPointList`, []);
        player.setProperty(`property:checked_stamp_count`, 0);
        player.sendMessage(`§6[スタンプラリー]§f 記録を初期化しました`);
    }

    static showRoadmap(player, mapNumber) {
        let maxStampCount;
        if(mapNumber == 1)maxStampCount = 8;
        if(mapNumber == 2)maxStampCount = 6;

        const checkedList = CheckPoint.getCheckedList(player);

        const form = new ActionFormData();
        form.title(`スタンプラリー ロードマップ§${mapNumber}`);

        //start
        const started = true;
        if(started) form.button(`§2§g§r§fスタート!`, `textures/items/spyglass`);
        else form.button(`§2§n§r§fスタート!`, `textures/items/spyglass`);

        //numbers
        for(let i=1; i<=maxStampCount; i++) {
            const number = `${i}`;
            const data = CheckPoint.getList()[number];

            if(data.pos) {
                const checked = checkedList.includes(number);

                if(checked) form.button(`§1§g§r§f${data.title}\n${data.description ?? ''}`, `textures/ui/confirm`);
                else form.button(`§1§n§r§f${data.title}\n${data.description}`, `textures/ui/cancel`);
            }else form.button(`§1§n§r§f未登録`, `textures/blocks/barrier`);
        };

        //end
        const ended = player.getProperty(`property:checked_stamp_count`) >= maxStampCount;
        if(ended) form.button(`§2§g§r§fスタンプラリー完了!!`, `textures/items/spyglass`);
        else form.button(`§2§n§r§fスタンプラリー完了!`, `textures/items/spyglass`);

        form.show(player);
    }

    static getMapNumberForItem(itemStack) {
        if(itemStack?.typeId == Stamprally.STAMPBOARD_ITEM_ID_1)return 1;
        else if(itemStack?.typeId == Stamprally.STAMPBOARD_ITEM_ID_2)return 2;
    }
}


function getY(x) {
    /**
     * x が 40以上のときは y=boardRotaY
     * x が rangeX未満の場合は y= 15
     * x が 40 ~ rangeX の間はは y は 80 ~ 15　
     */ 
    const boardRotaY = 80;
    const rangeX = 20;
    const minY = 15;
    const maxX = 30;

    const slope = (boardRotaY - minY) / (maxX - rangeX);

    return Math.min(
        boardRotaY,
        Math.max(minY, minY + slope * (x - rangeX))
    );
}