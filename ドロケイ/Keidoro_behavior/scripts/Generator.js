import { world, system, Player, BlockVolume, } from "@minecraft/server";
import { WorldLoad } from "./lib/WorldLoad";
import { log, Util } from "./lib/Util"; 
import { WorldDB, PlayerDB } from "./lib/Database";
import { Position } from "./Position";
import { Vector } from "./lib/Vector";
import { Game } from "./Game";
import { Role } from "./Role";
import { StunGrenade } from "./StunGrenade";


const MAX_CHARGE = 300;
const COOLDOWN = 60;


export class Generator { 
    static 1 = { charge:0, cooldown:0 };
    static 2 = { charge:0, cooldown:0 };

    
    /**
     * 常時実行
     */
    static run() {
        if(system.currentTick % 20 != 0)return;

        for(const number of [ 1, 2 ]) {
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
        if(Generator[number].charge < MAX_CHARGE)return;

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
        Generator[number].cooldown = COOLDOWN;
    }


    /**
     * 発電機をリセット
     */
    static reset() {
        Generator[1] = { charge:0, cooldown:0 };
        Generator[2] = { charge:0, cooldown:0 };
    }


    static getInfo(number) {
        return {
            percent: Math.round((Generator[number].charge / MAX_CHARGE) * 100),
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
}