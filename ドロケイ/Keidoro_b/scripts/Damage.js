import { world, system, Player, EntityHurtBeforeEvent, Entity, } from "@minecraft/server";
import { WorldLoad } from "./lib/WorldLoad";
import { log, Util } from "./lib/Util"; 
import { WorldDB, PlayerDB } from "./lib/Database";
import { Game } from "./Game";
import { Role } from "./Role";
import { Position } from "./Position";


const RESISTANCE = 10 * 20;

 
export class Damage { 
    constructor(ev) {
        /** @type {EntityHurtBeforeEvent} */ this.ev = ev;
        /** @type {Entity} */this.hurtEntity = this.ev.hurtEntity;
        /** @type {Entity} */this.damagingEntity = this.ev.damageSource.damagingEntity;
        /** @type {string} */this.cause = this.ev.damageSource.cause;
    }


    hurt() {
        if(!Util.isPlyaer(this.hurtEntity) || !Util.isPlyaer(this.damagingEntity))return;

        //参加中、プレイ中の場合はダメージをキャンセル
        const hurtState = Game.getState(this.hurtEntity);
        const damagingState = Game.getState(this.damagingEntity);
        if(!hurtState && !damagingState)return;
        this.ev.cancel = true;
        
        const hurtRole = Role.get(this.hurtEntity);
        const damagingRole = Role.get(this.damagingEntity);
        if(hurtRole != `thief` && damagingRole != `police`)return;


        //ゲーム中以外の場合
        if(!Game.ingame)return;
        if(Game.phase != 2)return;


        //無敵時間の場合
        if(Role.getResistane(this.hurtEntity) > 0)return;

        if(this.cause != `entityAttack`)return;

        const life = Role.getLife(this.hurtEntity);
        //残機がない場合
        if(life == -1)return;

        Role.setLife(this.hurtEntity, life-1);
        if(life == 0) { //牢屋生き
            Util.sendMessage(Game.players, `§b${this.hurtEntity.name} §4が §c${this.damagingEntity.name} §4に捕まった`);

            system.run(() => {
                this.damagingEntity.playSound(`random.orb`, { pitch:1.2 });
                this.damagingEntity.onScreenDisplay.setTitle(`§f`, {
                    fadeInDuration:0, stayDuration:60, fadeOutDuration:20,
                    subtitle: `§4>> §f${this.hurtEntity.name}§4を捕まえた <<`
                });

                this.hurtEntity.playSound(`random.orb`, { pitch:1.2 });
                this.hurtEntity.teleport(Position.PRISON);
                this.hurtEntity.onScreenDisplay.setTitle(`§f`, {
                    fadeInDuration:0, stayDuration:60, fadeOutDuration:20,
                    subtitle: `§4捕まってしまった...`
                });
            });
        }else if(life > 0) { //復活
            Util.sendMessage(Game.players, `§b${this.hurtEntity.name} §fが §c${this.damagingEntity.name} §fに捕まった`);

            system.run(() => {
                this.damagingEntity.playSound(`random.orb`, { pitch:1.2 });
                this.damagingEntity.onScreenDisplay.setTitle(`§f`, {
                    fadeInDuration:0, stayDuration:60, fadeOutDuration:20,
                    subtitle: `§4>> §f${this.hurtEntity.name}§4を捕まえた <<`
                });
                
                this.hurtEntity.playSound(`random.orb`, { pitch:1.2 });
                this.hurtEntity.teleport(Position.RESPAWN);
                this.hurtEntity.onScreenDisplay.setTitle(`§f`, {
                    fadeInDuration:0, stayDuration:60, fadeOutDuration:20,
                    subtitle: `§4捕まってしまった...`
                });

                //無敵時間を追加
                Role.setResistane(this.hurtEntity, RESISTANCE);
            });
        }
    }
}