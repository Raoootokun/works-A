import { world, system, BlockVolume } from "@minecraft/server";
import { log, Util } from "./lib/Util";
import { Position } from "./Position";
import { Struct } from "./Struct";

const DEFAULT_BLOCK_ID = `minecraft:stone`;

export class Floor {
    /**
     * idから床をリセット
     */
    static set(id) {
        const fromPos = Position.FLOOR[id].from;
        const toPos = Position.FLOOR[id].to;

        const overworld = world.getDimension(`overworld`);
        overworld.fillBlocks(new BlockVolume(fromPos, toPos), DEFAULT_BLOCK_ID);
    };


    /**
     * すべて床をリセット
     */
    static setAll() {
        for(const id of Struct.ids) {
            Floor.set(id);
        }
    };


    /**
     * idから床を削除
     */
    static air(id) {
        const fromPos = Position.FLOOR[id].from;
        const toPos = Position.FLOOR[id].to;

        const overworld = world.getDimension(`overworld`);
        overworld.fillBlocks(new BlockVolume(fromPos, toPos), `air`);
    };


    /**
     * すべて床をリセット
     */
    static airAll() {
        for(const id of Struct.ids) {
            Floor.air(id);
        }
        
    };

}