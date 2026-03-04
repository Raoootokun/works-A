import { world, system, } from "@minecraft/server";
import { log, Util } from "./lib/Util";
import { Game } from "./Game";
import { Form } from "./Form";
import { Damage } from "./Damage";
import { Generator } from "./Generator";
import { StunGrenade } from "./StunGrenade";


system.afterEvents.scriptEventReceive.subscribe(ev => {
    const { id, message, sourceEntity } = ev;

    if(id == `kd:join`) Game.join(sourceEntity);
    if(id == `kd:exit`) Game.exit(sourceEntity);
    if(id == `kd:book`) Form.giveBook(sourceEntity);
});


world.afterEvents.itemUse.subscribe(ev => {
    const { source, itemStack } = ev;

    if(itemStack.getLore().includes(`§k§d§`))Form.showMain(source);
});


world.afterEvents.playerSpawn.subscribe(ev => {
    const { player, initialSpawn } = ev;

    if(initialSpawn)Game.load(player);
});


world.beforeEvents.entityHurt.subscribe(ev => {
    const {  } = ev;

    const damage = new Damage(ev);
    damage.hurt();
});


world.afterEvents.leverAction.subscribe(ev => {
    const { player, block, dimension, isPowered } = ev;

    Generator.charge(player, block.location);
});


world.afterEvents.projectileHitEntity.subscribe(ev => {
    StunGrenade.hit(ev);
})