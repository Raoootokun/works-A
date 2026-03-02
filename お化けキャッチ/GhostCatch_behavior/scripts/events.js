import { world, system, } from "@minecraft/server";
import { log, Util } from "./lib/Util";
import { Game } from "./Game";
import { Form } from "./Form";

system.afterEvents.scriptEventReceive.subscribe(ev => {
    const { id, message, sourceEntity } = ev;

    if(id == `gc:book`) Form.giveBook(sourceEntity);
    if(id == `gc:join`) Game.join(sourceEntity);
    if(id == `gc:exit`) Game.exit(sourceEntity);
});


world.afterEvents.playerSpawn.subscribe(ev => {
    const { player, initialSpawn } = ev;

    if(initialSpawn)Game.load(player);
});


world.afterEvents.itemUse.subscribe(ev => {
    const { source, itemStack } = ev;

    if(itemStack.getLore().includes(`§g§c§`))Form.showMain(source);
});