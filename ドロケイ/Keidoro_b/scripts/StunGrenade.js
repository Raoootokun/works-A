import { world, system, Player, BlockVolume, ItemStack, ProjectileHitEntityAfterEvent, } from "@minecraft/server";
import { WorldLoad } from "./lib/WorldLoad";
import { log, Util } from "./lib/Util"; 
import { WorldDB, PlayerDB } from "./lib/Database";
import { Position } from "./Position";
import { Vector } from "./lib/Vector";
import { Game } from "./Game";
import { Role } from "./Role";


const ITEM_ID = `minecraft:snowball`;
const PROJECTILE_ID = `minecraft:snowball`;
const EFFECT_DURATION = 5;


export class StunGrenade { 
    /**
     * アイテムを配布
     */
    static give(player) {
        const itemStack = new ItemStack(ITEM_ID, 1);
        itemStack.nameTag = `§6スタングレネード`;
        itemStack.lockMode = `inventory`;

        player.getComponent(`inventory`).container.addItem(itemStack);
    }


    /**
     * 被弾
     * @param {ProjectileHitEntityAfterEvent} ev 
     */
    static hit(ev) {
        const { source, location, hitVector, projectile, dimension } = ev;
        const entityHit = ev.getEntityHit();
        const hitPlayer = entityHit?.entity;

        if(projectile.typeId != PROJECTILE_ID)return;
        if(!source || !source.isValid)return;
        if(!hitPlayer || !hitPlayer.isValid)return;

        //ゲーム中か
        if(!Game.ingame)return;
        if(Game.phase != 2)return;

        //プレイ中か
        //泥棒かどうか
        //残機があるか
        if(Game.getState(source) != `play`)return; //プレイ中か
        if(Role.get(source) != `thief`)return;
        if(Role.getLife(source) == -1)return;

        //プレイ中か
        //警察かどうか
        if(Game.getState(hitPlayer) != `play`)return;
        if(Role.get(hitPlayer) != `police`)return;

        hitPlayer.addEffect(`slowness`, 20 * EFFECT_DURATION, { amplifier:10, showParticles:true });
        hitPlayer.addEffect(`blindness`, 20 * EFFECT_DURATION, { amplifier:10, showParticles:true });

        dimension.spawnParticle(`minecraft:wind_explosion_emitter`, Vector.addsY(hitPlayer.location, 1));
        Util.playSoundD(dimension, hitPlayer.location, `firework.blast`, { count:5 });
    }
}