import { world, system, } from "@minecraft/server";
import { WorldLoad } from "./lib/WorldLoad"
import { log } from "./lib/Util";
import { WorldDB, PlayerDB } from "./lib/Database";
import { Stamprally } from "./Stamprally";
import { CheckPoint } from "./CheckPoint";


system.afterEvents.scriptEventReceive.subscribe(ev => {
    const { id, message, sourceEntity } = ev;

    if(id == `sl:tool`) Stamprally.addTool(sourceEntity);
    if(id == `sl:board`) Stamprally.addBoard(sourceEntity, Number(message));
    if(id == `sl:reset`) Stamprally.reset(sourceEntity);
});


world.beforeEvents.playerInteractWithBlock.subscribe(ev => {
    const { player, itemStack, block, isFirstEvent } = ev;
    if(!isFirstEvent)return;

    //チェックポイント登録
    if(Stamprally.isTool(itemStack) && !player.isSneaking) {
        system.run(() => { CheckPoint.bind(player, block); });
        return ev.cancel = true;
    }

    //チェックポイントにタッチ
    if(Stamprally.isBoard(itemStack) && !player.isSneaking) {
        //チェックポイントのナンバーを取得
        const number = CheckPoint.getNumber(block);
        if(!number)return;

        system.run(() => { Stamprally.pressStamp(player, number); });
        return ev.cancel = true;
    };
});


world.beforeEvents.playerBreakBlock.subscribe(ev => {
    const { player, itemStack, block, } = ev;

    //チェックポイントを解除
    if(Stamprally.isTool(itemStack)) {
        system.run(() => { CheckPoint.unbind(player, block); });
        return ev.cancel = true;
    };
});


world.beforeEvents.itemUse.subscribe(ev => {
    const { source, itemStack, } = ev;

    //チェックポイント一覧表示
    if(Stamprally.isTool(itemStack) && source.isSneaking) {
        system.run(() => { CheckPoint.showList(source); });
        return ev.cancel = true;
    };

    //ロードマップを表示
    if(Stamprally.isBoard(itemStack) && source.isSneaking) {
        const mapNumber = Stamprally.getMapNumberForItem(itemStack);
        system.run(() => { Stamprally.showRoadmap(source, mapNumber); });
        return ev.cancel = true;
    };
        

    
});