import { world, system, Player, ItemStack, BlockVolume } from "@minecraft/server";
import { log, random, Util } from "./lib/Util";
import { ActionFormData } from "@minecraft/server-ui";
import { Game } from "./Game";
import { Vector } from "./lib/Vector";
import { Position } from "./Position";

/**

a,b,c,d,e


# 1
正解の像を決める


# 2
[type]
  same: 同じ像  /  30%
  irregular: 不一致な像  / 70%

typeを決める 
---------------------------

# 3
same の場合:
  同じ像を配置
  違う像を一つ配置 & 違う像の中から色を取得市、塗る

irregular の場合
  正解の像を取得
  それ以外の形を二つ取得、取得した二つ以外の色を取得し、塗る





 */


export class Struct {
    static get ids() {
        return [ `a`, `b`, `c`, `d`, `e` ];
    }
    static get colors() {
        return [ `white`, `blue`, `green`, `yellow`, `red` ];
    }
    static get entries() {
        return [ { id: "a", color: "white" }, { id: "b", color: "blue" }, { id: "c", color: "green" }, { id: "d", color: "yellow" }, { id: "e", color: "red" }, ];
    }


    
    static set() { 
        

        const info = Struct.getInfo();

        Struct.place(info.struct1, info.struct2);
        // log(info, 1);
        


        return info;
    }


    /**
     * 正解を決定
     */
    static getInfo() {
        //正解の像
        const answerIdx = random(0, 4, true);
        const answerId = Struct.ids[answerIdx];
        const answerColor = Struct.colors[answerIdx];

        //タイプを決定
        const type = Struct.getType();

        let struct1;
        let struct2;

        if(type == `same`) {
            struct1 = { id: answerId, color: `default`, };

            //正解以外の像を取得
            const entries = Struct.entries.filter(d => d.id != answerId);
            
            const fakeId = entries[random(0, 3, true)].id;
            const fakeColor = entries.filter(d => d.id != fakeId)[random(0, 2, true)].color;
            struct2 = { id: fakeId, color: fakeColor, };
        }else if(type == `irregular`) {
            //偽物の像を取得
            const entries = Struct.entries.filter(d => d.id != answerId);

            const fakeId1 = entries[random(0, 3, true)].id;
            const fakeId2 = entries.filter(d => d.id != fakeId1)[random(0, 2, true)].id;

            const fakeColor1 = entries.filter(d => ( d.id != fakeId1 && d.id != fakeId2 ))[random(0, 1, true)].color;
            const fakeColor2 = entries.find(d => ( d.id != fakeId1 && d.id != fakeId2 && d.color != fakeColor1 )).color;

            struct1 = { id: fakeId1, color: fakeColor1, };
            struct2 = { id: fakeId2, color: fakeColor2, };
        }

        return {
            type: type,
            answerId: answerId,
            struct1: struct1,
            struct2: struct2,
        }
    }


    /**
     * typeを決定
     */
    static getType() {
        const r = random(1, 100);

        const samePer = 30;
        const irregularPer = 70;
        if(r < samePer) return `same`;
        else return `irregular`;
    }


    /**
     * 像を配置
     */
    static place(struct1, struct2) {
        const overworld = world.getDimension(`overworld`);
        const from = Vector.add(Position.STAGE.center, { x:-10, y:0, z:-4 });
        const to = Vector.add(Position.STAGE.center, { x:10, y:11, z:4 });
        overworld.fillBlocks(new BlockVolume(from, to), `air`, { blockFilter:{ excludeTypes:[`minecraft:soul_lantern`] } });

        const size1 = Vector.subtract(world.structureManager.get(struct1.id).size, 1);
        const size2 = Vector.subtract(world.structureManager.get(struct2.id).size, 0);

        const p1 = Vector.copy(Position.STAGE.center);
        const p2 = Vector.addsZ(Position.STAGE.center, -size2.z);

        const max = Vector.addsZ(Position.STAGE.center, size1.z);
        const min = Vector.addsZ(Position.STAGE.center, -size2.z);
        //中心から何マスづれているか
        const absMax = Math.abs(Position.STAGE.center.z - max.z);
        const absMin = Math.abs(Position.STAGE.center.z - min.z);
        //ずれを取得
        const abs = Math.ceil((absMax - absMin) / 2);

        //Z(横)を調節
        p1.z -= abs;
        p2.z -= abs;

        //真ん中を開ける
        p1.z += 1;

        //X(前後)を調節
        p1.x -= Math.floor(size1.x / 2);
        p2.x -= Math.floor(size2.x / 2);

        //Y(高さ)を調節
        if(struct1.id == `b`) p1.y += 2;
        else if(struct1.id == `d`) p1.y += 4;
        if(struct2.id == `b`) p2.y += 2;
        else if(struct2.id == `d`) p2.y += 4;

        //像を配置
        world.structureManager.place(struct1.id, world.getDimension(`overworld`), p1, { mirror:`Z` });
        world.structureManager.place(struct2.id, world.getDimension(`overworld`), p2, { mirror:`Z` });

        
        const fromP1 = p1;
        const toP1 = Vector.add(p1, size1);
        const fromP2 = p2;
        const toP2 = Vector.add(p2, size2);
 

        if(struct1.color != `default`) {
            overworld.fillBlocks(new BlockVolume(fromP1, toP1), `${struct1.color}_wool`, { 
                blockFilter: { includeTypes:[ `white_wool`, `blue_wool`, `green_wool`, `yellow_wool`, `red_wool` ] } 
            });   
        };
        if(struct2.color != `default`) {
            overworld.fillBlocks(new BlockVolume(fromP2, toP2), `${struct2.color}_wool`, { 
                blockFilter: { includeTypes:[ `white_wool`, `blue_wool`, `green_wool`, `yellow_wool`, `red_wool` ] } 
            });   
        };


        overworld.spawnParticle(`minecraft:huge_explosion_emitter`, Vector.add(Position.STAGE.center, { x:3, y:5, z:5 }));
        overworld.spawnParticle(`minecraft:huge_explosion_emitter`, Vector.add(Position.STAGE.center, { x:3, y:5, z:-5 }));
        overworld.spawnParticle(`minecraft:huge_explosion_emitter`, Vector.add(Position.STAGE.center, { x:3, y:5, z:-10 }));
        overworld.spawnParticle(`minecraft:huge_explosion_emitter`, Vector.add(Position.STAGE.center, { x:3, y:5, z:10 }));
    }


    static getVolumeInfo(answerId) {
        const asnwerVolume = new BlockVolume(Position.GOAL[answerId].from, Position.GOAL[answerId].to);

        const noVolumes = [];
        const noIds = Struct.ids.filter(i => i != answerId);
        for(let id of noIds) {
            noVolumes.push(new BlockVolume(Position.HOLE[id].from, Position.HOLE[id].to));
        }

        return { asnwerVolume:asnwerVolume, noVolumes:noVolumes }
    }
}