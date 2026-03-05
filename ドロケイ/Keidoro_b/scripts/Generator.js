import { world, system, Player, BlockVolume, } from "@minecraft/server";
import { debugDrawer, DebugText, DebugLine, DebugBox, DebugArrow, DebugCircle } from "@minecraft/debug-utilities";
import { WorldLoad } from "./lib/WorldLoad";
import { log, Util } from "./lib/Util"; 
import { WorldDB, PlayerDB } from "./lib/Database";
import { Position } from "./Position";
import { Vector } from "./lib/Vector";
import { Game } from "./Game";
import { Role } from "./Role";
import { StunGrenade } from "./StunGrenade";
import { Config } from "./Config";



export class Generator { 
    static 1 = { charge:0, cooldown:0, shape:undefined };
    static 2 = { charge:0, cooldown:0, shape:undefined };

    
    /**
     * 常時実行
     */
    static run() {
        if(system.currentTick % 20 != 0)return;

        for(const number of [ 1, 2 ]) {
            Generator.drawShape(number);

            //cd中かどうか
            if(!Generator[number].cooldown)continue;

            Generator[number].cooldown--;

            //cdが終了時に通知
            if(!Generator[number].cooldown) {
                Generator[number].charge = 0;

                for(const player of  Game.players) {
                    if(Role.get(player) == `police`)continue;
                    player.sendMessage(`§v発電機が使用可能になった!`);
                };
            }
        }
    }


    /**
     * 発電機をチャージ
     */
    static charge(player, pos) {
        //発電機のnumberを取得
        const number = Generator.getNumber(pos);
        //登録されていない場合
        if(!number)return;
 
        //ゲーム中かどうか
        if(!Game.ingame)return;
        //プレイ中の泥棒かどうか

        if(Game.getState(player) != `play`)return;
        if(Role.get(player) != `thief`)return;
 
        //cd中
        if(Generator[number].cooldown)return player.sendMessage(`§cCD中のため使用できない...`)

        Generator[number].charge += 1;
        //最大チャージされた場合
        if(Generator[number].charge < Config.GENERATOR_CHARGE)return;

        //スタグレを配布
        for(const player of  Game.players) {
            player.sendMessage(`§v発電機の電力が最大まで貯まった!`);

            if(Role.get(player) == `thief` && Role.getLife(player) > -1) {
                player.sendMessage(`§bスタングレネードを入手!`);
                player.playSound(`random.orb`, { pitch:0.8 });

                StunGrenade.give(player);
            }
        }

        //cd追加
        Generator[number].cooldown = Config.GENERATOR_COOLDOWN;
    }


    /**
     * 発電機をリセット
     */
    static reset() {
        //前回のShapeがある場合は削除
        if(Generator[1].shape)debugDrawer.removeShape(Generator[1].shape);
        if(Generator[2].shape)debugDrawer.removeShape(Generator[2].shape);

        Generator[1] = { charge:0, cooldown:0, shape:new DebugText(Position.GENERATOR_1, ``) };
        Generator[2] = { charge:0, cooldown:0, shape:new DebugText(Position.GENERATOR_2, ``) };
    }


    static getInfo(number) {
        return {
            percent: Math.round((Generator[number].charge / Config.GENERATOR_CHARGE) * 100),
            cooldown: Generator[number].cooldown,
        };
    }


    /**
     * 座標が登録されている座標の周囲かどうか
     */
    static getNumber(pos) {
        const pos1 = Position.GENERATOR_1;
        const vol1 = new BlockVolume(Vector.subtract(pos1, 3), Vector.add(pos1, 3));
        if(vol1.isInside(pos))return 1;

        const pos2 = Position.GENERATOR_2;
        const vol2 = new BlockVolume(Vector.subtract(pos2, 3), Vector.add(pos2, 3));
        if(vol2.isInside(pos))return 2;

        return 0;
    }


    /**
     *Shapeを描画
     */
    static drawShape(number) {
        const shape = Generator[number].shape;
        shape.setLocation(Vector.add(Position[`GENERATOR_${number}`], { x:-0.0, y:1, z:-0.0 }));
        
        let txt = `§v発電機 - ${number}`;
        if(Generator[number].cooldown) txt += `\n§c使用可能まで: §f${Generator[number].cooldown}§c秒`;
        else {
            const gage = createGage(Generator[number].charge, Config.GENERATOR_CHARGE, `§e=`, `§7=`);
            const percent = Math.round((Generator[number].charge / Config.GENERATOR_CHARGE) * 100);
            txt += ` §f| §v§f${percent}§v%\n§f§l[${gage}§f§l]`;
        }

        const players = Role.getThiefs(Game.players);
        shape.visibleTo = players;

        shape.text = txt;
        debugDrawer.addShape(shape);
    }


    /**
     * Shapeを削除
     */
    static removeAllShape() {
        if(Generator[1].shape)debugDrawer.removeShape(Generator[1].shape);
        if(Generator[2].shape)debugDrawer.removeShape(Generator[2].shape);
    }
}


function createGage(current, max, filledText, emptyText) {
    const LENGTH = 10;

    if (max <= 0) return emptyText.repeat(LENGTH);

    const ratio = Math.max(0, Math.min(1, current / max));
    const filledCount = Math.round(ratio * LENGTH);
    const emptyCount = LENGTH - filledCount;

    return filledText.repeat(filledCount) + emptyText.repeat(emptyCount);
}

