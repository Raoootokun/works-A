import { world, system, Player, ItemStack, EnchantmentType, } from "@minecraft/server";
import { log, Util } from "./lib/Util";

export class Item {
    static getFishingRod() {
        const itemStack = new ItemStack(`minecraft:fishing_rod`);
        itemStack.lockMode = `inventory`;

        const enchantComp = itemStack.getComponent(`enchantable`);
        enchantComp.addEnchantment({ type:new EnchantmentType("lure"), level:2 });

        return itemStack;
    };

    /**
     * 釣り竿を付与
     * 付与成功:true 付与失敗:false
     * @param {Player} player 
     */
    static add(player) {
        const res = player.getComponent(`inventory`).container.addItem(Item.getFishingRod());

        if(res)return false;
        else return true;
    };

    static repairFishingRod(player) {
        const container = player.getComponent(`inventory`).container;
        for(let i=0; i<container.size; i++) {
            const itemStack = container.getItem(i);
            if(itemStack?.typeId != `minecraft:fishing_rod`)continue;

            container.setItem(i, Item.getFishingRod());
        }
    }

    /**
     * 釣り竿を回収
     * @param {Player} player 
     */
    static clearFishingRod(player) {
        const container = player.getComponent(`inventory`).container;
        for(let i=0; i<container.size; i++) {
            const itemStack = container.getItem(i);
            if(itemStack?.typeId != `minecraft:fishing_rod`)continue;

            container.setItem(i);
        }
    }

    /**
     * 釣り竿を回収
     * @param {Player} player 
     * @param {ItemStack} findItemStack 
     */
    static clearFish(player, findItemStack) {
        //レアアイテムの場合
        if(findItemStack?.typeId == `fg:boni` || findItemStack?.typeId == `fg:itou`)return;


        let interval = 60;
        
        const container = player.getComponent(`inventory`).container;
        const systemNum = system.runInterval(() => {
            if(60 <= 0)return system.clearRun(systemNum);

            for(let i=0; i<container.size; i++) {
                const itemStack = container.getItem(i);
                if(!itemStack)continue;

                if(findItemStack.typeId == itemStack.typeId) {
                    container.setItem(i);
                    return system.clearRun(systemNum);
                };
                // const isFgItem = itemStack.getLore().find(txt => txt == `fg_item`);
                // if(isFgItem) {
                //     container.setItem(i);
                //     return system.clearRun(systemNum);
                // }
            };

            interval -= 20;
        }, 20);
    }

}