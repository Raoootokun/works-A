import { world, system, Player, } from "@minecraft/server";

let overworld;
system.run(() => {
    overworld = world.getDimension("overworld");
});

export class ExHud {
    /**
     * @param {Player} player 
     * @param {string} text 
     * @param {number} stayDuration 
     */
    static actionbar(player, text, stayDuration = 60) {
        player.runCommand(`eh:actionbar @s "${text}" ${stayDuration}`);
    }

    /**
     * @param {Player} player 
     * @param {string} objectiveId 
     * @param {string} text 
     * @param {number} score 
     */
    static sidebarSet(player, objectiveId, text, score) {
        player.runCommand(`eh:sidebar.set @s ${objectiveId} "${text}" ${score}`);
    }

    /**
     * @param {Player} player 
     * @param {string} objectiveId 
     * @param {string} baseText 
     */
    static sidebarRefSet(player, objectiveId, baseText) {
        player.runCommand(`eh:sidebar.refset @s ${objectiveId} "${baseText}"`);
    }

    /**
     * @param {Player} player 
     * @param {string} objectiveId 
     */
    static sidebarRefSetAll(player, objectiveId) {
        player.runCommand(`eh:sidebar.refsetall @s ${objectiveId}`);
    }

    /**
     * @param {Player} player 
     * @param {string} objectiveId 
     * @param {string} text 
     */
    static sidebarReset(player, objectiveId, text) {
        player.runCommand(`eh:sidebar.reset @s ${objectiveId} "${baseText}"`);
    }

    /**
     * @param {Player} player 
     * @param {string} objectiveId 
     */
    static sidebarResetAll(player, objectiveId) {
        player.runCommand(`eh:sidebar.resetall @s ${objectiveId}`);
    }

    /**
     * @param {Player} player 
     * @param {string} objectiveId 
     * @param {string} displayName 
     */
    static sidebarDisplay(player, objectiveId, displayName = undefined) {
        if(displayName == undefined) player.runCommand(`eh:sidebar.display @s ${objectiveId}`);
        else player.runCommand(`eh:sidebar.display @s ${objectiveId} "${displayName}"`);
        
    }

    /**
     * @param {Player} player 
     * @param {string} objectiveId
     */
    static sidebarShow(player, objectiveId = undefined) {
        if(objectiveId != undefined) player.runCommand(`sidebar.show @s ${objectiveId}`);
        else player.runCommand(`eh:sidebar.show @s`);
    }

    /**
     * @param {number} sortNumber
     */
    static sidebarSort(sortNumber) {
        if(sortNumber == 0)overworld.runCommand(`eh:sidebar.sort ascending`);
        else if(sortNumber == 1) overworld.runCommand(`eh:sidebar.sort descending`);
    }
    
};