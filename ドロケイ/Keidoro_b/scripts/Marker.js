import { world, system, Player, } from "@minecraft/server";
import { debugDrawer, DebugText, DebugLine, DebugBox, DebugArrow, DebugCircle } from "@minecraft/debug-utilities";
import { WorldLoad } from "./lib/WorldLoad";
import { log, Util } from "./lib/Util"; 
import { WorldDB, PlayerDB } from "./lib/Database";
import { Vector } from "./lib/Vector";
import { Game } from "./Game";


const PDB = new PlayerDB(`glow`);


export class Marker { 
    static run(player) {
        const tick = Marker.get(player);
        if(tick > 0) {
            Marker.set(player, tick-1);
            player.setProperty(`property:marker`, true);

            Marker.drawShape(player);
            Marker.animShape(player);
        }else {
            player.setProperty(`property:marker`, false);

            Marker.removeShape(player);
        }
    }


    /**
     * 取得
     */
    static get(player) {
        return PDB.get(player, `glow`) ?? 0;
    }


    /**
     * 取得
     */
    static set(player, tick) {
        PDB.set(player, `glow`, tick);
    }


    static drawShape(player) {
        //すでにshapeが作成済みかどうか
        if(player.markerShape) {
            player.markerShape.visibleTo = Game.players.filter(p => { p.id != player.id });
            debugDrawer.addShape(player.markerShape);
            return;
        }

        const shape = new DebugText(player.location, `§l`);
        shape.attachedTo = player;
        shape.scale = 2;
        shape.setLocation({ x:0, y:1.1, z:0 })

        player.markerShape = shape;
    }


    static animShape(player) {
        const frameTick = 5;
        if(system.currentTick % frameTick != 0)return;

        if(!player.markerShape)return;
        if(player.markerShapeAnimF == undefined)player.markerShapeAnimF = 0;

        const animFrames = {
            0: `>>>> §l発光中§r <<<<`,
            1: `>>> §l発光中§r <<<`,
            2: `>> §l発光中§r <<`,
            3: `> §l発光中§r <`,
            4: `§l発光中§r`,
        };
        player.markerShape.text = animFrames[player.markerShapeAnimF];

        
        if(player.markerShapeAnimF == Object.keys(animFrames).length - 1)player.markerShapeAnimF = 0;
        else player.markerShapeAnimF++;
    }


    static removeShape(player) {
        if(!player.markerShape)return;

        debugDrawer.removeShape(player.markerShape);
        delete player.markerShape;
    }
}