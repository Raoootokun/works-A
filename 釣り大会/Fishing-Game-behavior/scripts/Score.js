import { world, system, Player, } from "@minecraft/server";
import { log, Util } from "./lib/Util";
import { worldDB } from "./main";

export class Score {
    static get objective() {
        return world.scoreboard.getObjective(`fg_point`);
    };

    /**
     * 魚からポイントを取得
     * @param {string} fishId 
     */
    static getScoreFromFish(fishId) {
        const scores = worldDB.get(`scores`);

        return scores[fishId] ?? 0;
    };


    /**
     * スコアを初期化
     * @param {Player} player 
     */
    static init(player) {
        Score.objective.setScore(`§f${player.name}`, 0);
    }

    /**
     * スコアを追加
     * @param {Player} player 
     */
    static add(player, fishId) {
        const score = Score.getScoreFromFish(fishId);
        Score.objective.addScore(`§f${player.name}`, score);

        return score;
    };

    /**
     * スコアを取得
     * @param {Player} player 
     */
    static get(player) {
        return Score.objective.getScore(`§f${player.name}`);
    }




}