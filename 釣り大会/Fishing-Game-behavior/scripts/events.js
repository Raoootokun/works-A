import { world, system, Player, } from "@minecraft/server";
import { log, Util } from "./lib/Util";
import playerFishingAfterEvent from "./playerFishingAfterEvent";
import { GameSystem } from "./GameSystem";
import { Form } from "./Form";

playerFishingAfterEvent.subscribe(ev => {
    const { player, itemStack, itemEntity, result } = ev;

    if(!result)return;
    GameSystem.fishing(player, itemStack, itemEntity);
});


system.afterEvents.scriptEventReceive.subscribe(ev => {
    const { id, message, sourceType, sourceEntity, sourceBlock } = ev;

    if(id == `fg:init`) GameSystem.init();
    if(id == `fg:join`) GameSystem.join(sourceEntity);
    if(id == `fg:play`) GameSystem.play(sourceEntity);
    if(id == `fg:exit`) GameSystem.exit(sourceEntity);
    if(id == `fg:setting`) Form.showSetting(sourceEntity);
});


world.afterEvents.playerSpawn.subscribe(ev => {
    const { player, initialSpawn } = ev;

    GameSystem.check(player);
})