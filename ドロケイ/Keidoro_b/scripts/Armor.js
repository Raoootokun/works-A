import { world, system, Player, EntityHurtBeforeEvent, Entity, ItemStack, EnchantmentType, } from "@minecraft/server";
import { WorldLoad } from "./lib/WorldLoad";
import { log, Util } from "./lib/Util"; 
import { WorldDB, PlayerDB } from "./lib/Database";


export class Armor { 
    static helmet;
    static chestplate;
    static leggings;
    static boots;


    /**
     * 装着
     * @param {Player} player 
     */
    static attach(player) {
        const equipComp = player.getComponent(`equippable`);
        if(!equipComp.getEquipment(`Head`))equipComp.setEquipment(`Head`, Armor.helmet);
        if(!equipComp.getEquipment(`Chest`))equipComp.setEquipment(`Chest`, Armor.chestplate);
        if(!equipComp.getEquipment(`Legs`))equipComp.setEquipment(`Legs`, Armor.leggings);
        if(!equipComp.getEquipment(`Feet`))equipComp.setEquipment(`Feet`, Armor.boots);
    }


    /**
     * 
     * @param {Player} player 
     */
    static detach(player) {
        const equipComp = player.getComponent(`equippable`);
        if(equipComp.getEquipment(`Head`)?.nameTag == `§k§d`)equipComp.setEquipment(`Head`);
        if(equipComp.getEquipment(`Chest`)?.nameTag == `§k§d`)equipComp.setEquipment(`Chest`);
        if(equipComp.getEquipment(`Legs`)?.nameTag == `§k§d`)equipComp.setEquipment(`Legs`);
        if(equipComp.getEquipment(`Feet`)?.nameTag == `§k§d`)equipComp.setEquipment(`Feet`);
    }


    static load() {
        Armor.helmet = new ItemStack(`diamond_helmet`);
        Armor.helmet.nameTag = `§k§d`;
        Armor.helmet.lockMode = `slot`;
        Armor.helmet.getComponent(`enchantable`).addEnchantment({ type:new EnchantmentType(`mending`), level:1 });

        Armor.chestplate = new ItemStack(`diamond_chestplate`);
        Armor.chestplate.nameTag = `§k§d`;
        Armor.chestplate.lockMode = `slot`;
        Armor.chestplate.getComponent(`enchantable`).addEnchantment({ type:new EnchantmentType(`mending`), level:1 });

        Armor.leggings = new ItemStack(`diamond_leggings`);
        Armor.leggings.nameTag = `§k§d`;
        Armor.leggings.lockMode = `slot`;
        Armor.leggings.getComponent(`enchantable`).addEnchantment({ type:new EnchantmentType(`mending`), level:1 });

        Armor.boots = new ItemStack(`diamond_boots`);
        Armor.boots.nameTag = `§k§d`;
        Armor.boots.lockMode = `slot`;
        Armor.boots.getComponent(`enchantable`).addEnchantment({ type:new EnchantmentType(`mending`), level:1 });
    }
}


WorldLoad.subscribe(() => {
    Armor.load();
})