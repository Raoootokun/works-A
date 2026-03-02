import { world, system, ItemStack, Player, } from "@minecraft/server";
import { ActionFormData, MessageFormData, ModalFormData } from "@minecraft/server-ui";
import { debugDrawer, DebugText, DebugLine, DebugBox, DebugArrow, DebugCircle } from "@minecraft/debug-utilities";
import { WorldLoad } from "./lib/WorldLoad"
import { log } from "./lib/Util";
import { playerDB, worldDB } from "./main";
import { Vector } from "./lib/Vector";
import { Stamprally } from "./Stamprally";
import { CheckPoint } from "./CheckPoint";

export class Shape {
    static list;
    
    static run() {
        //ラグ防止のため 20tick毎に実行
        if(system.currentTick % 20 != 0)return

        //リストがない場合、作成
        if(!Shape.list) {
            Shape.list = {};
            for(let i=1; i<=Stamprally.MAX_STAMP_COUNT; i++) {
                Shape.list[i] = null;
            };
        }


        const list = Shape.list;
        const checkPointList = CheckPoint.getList();
        for(const number of Object.keys(list)) {
            const data = checkPointList[number];
            //チェックポイントが未登録の場合
            if(!data.pos) {
                if(list[number]?.on)debugDrawer.removeShape(list[number].on);
                if(list[number]?.off)debugDrawer.removeShape(list[number].off);
                continue;
            }
            
            //シェイプが作成済みかどうか
            if(list[number]) { //
                const onVisibleTo = [];
                const offVisibleTo = [];

                //プレイヤー
                for(const player of world.getPlayers()) {
                    //距離を取得
                    const dis = Vector.distance(player.location, data.pos);
                    if(dis >= 20) continue;

                    //スタンプを押した回数を取得
                    const checkedStampCount = CheckPoint.getCheckedList(player);

                    //表示リストの入れる
                    if(checkedStampCount.includes(number))onVisibleTo.push(player);
                    else offVisibleTo.push(player);
                };

                const onShape = list[number].on;
                const offShape = list[number].off;
                //表示するプレイヤーがいない場合は削除
                if(onVisibleTo.length == 0) debugDrawer.removeShape(onShape);
                else {
                    onShape.visibleTo = onVisibleTo;
                    onShape.setLocation(Vector.add(data.pos, { x:0.5, y:1, z:0.5 }));
                    debugDrawer.addShape(onShape);
                };

                if(offVisibleTo.length == 0) debugDrawer.removeShape(offShape);
                else {
                    offShape.visibleTo = offVisibleTo;
                    offShape.setLocation(Vector.add(data.pos, { x:0.5, y:1, z:0.5 }));
                    debugDrawer.addShape(offShape);
                };
            }else { //未作成
                const onShape = new DebugText(data.pos, `§l[§a〆§f] スタンプ${number}`);
                onShape.setLocation(Vector.add(data.pos, { x:0.5, y:1, z:0.5 }))
                debugDrawer.addShape(onShape);

                const offShape = new DebugText(data.pos, `§l[ ] スタンプ${number}`);
                onShape.setLocation(Vector.add(data.pos, { x:0.5, y:1, z:0.5 }))
                debugDrawer.addShape(onShape);

                list[number] = {
                    on: onShape,
                    off: offShape,
                };
            }
        };

    }
}