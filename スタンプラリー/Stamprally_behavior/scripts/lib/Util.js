//==================================================
// v1.0.0 / 2026/01/23
//==================================================
import { EffectTypes, ItemStack, Player, system, world } from "@minecraft/server";
import { Vector } from "./Vector";
/**
 *  チャットに値を出力します
 * @param {*} value 
 * @param {boolean} organize 値を整頓して表示する
 * @param {number} tick logを出すtick
 * @returns 
 */
export function log(value, organize = false, tick = 1) {
    if(system.currentTick % tick != 0)return;
    
    try{
        if(typeof value == `string`)return world.sendMessage(value);
        if(organize)return world.sendMessage(`${JSON.stringify(value, null, 2)}`);
        world.sendMessage(`${JSON.stringify(value)}`);
    }catch(e) {
        system.run(() => {
            if(typeof value == `string`)return world.sendMessage(value);
            if(organize)return world.sendMessage(`${JSON.stringify(value, null, 2)}`);
            world.sendMessage(`${JSON.stringify(value)}`);
        });
    }
};

/**
 * 入力した配列の順番をシャッフルして返します
 * @param {any[]} array 
 * @returns {any[]}
 */
export function aryShuffle(array) {
    const cloneAry = [...array];
    for(let i=cloneAry.length-1; i>=0; i--){
        let rand = Math.floor(Math.random() * (i+1));
        let tmpStorage = cloneAry[i];
        cloneAry[i] = cloneAry[rand];
        cloneAry[rand] = tmpStorage;
    };
    return cloneAry;
};

export function getFacing(target) {
    if(!target)return;
    const rota = target.getRotation();
  
    if(rota.y >= -135 && rota.y <= -45){
        return "x";
    }else if(rota.y >= -45 && rota.y <= 45){
        return "z";
    }else if(rota.y >= 45 && rota.y <= 135){
        return "-x";
    }else if((rota.y >= 135 && rota.y <= 180) || (rota.y >= -180 && rota.y <= -135)){
        return "-z";
    };
};


export function getDate() {
    const date_ = new Date();
    const d = {
        month: date_.getMonth()+1,
        date: date_.getDate(),
        hours: date_.getHours()+9,
        minutes: date_.getMinutes(),
        secconds: date_.getSeconds()
    };
    return `${d.month}/${d.date}/${d.hours}:${d.minutes}`;
};

export function getSpeed(player) {
    const velo = player.getVelocity();

    return Vector.distance({x:0,y:0,z:0}, velo)*20
};

/**
 * 現在時刻を取得
 * "hh:mm:ss"
 * @returns {string}
 */
export function getTime() {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const tokyo = new Date(utc + (9 * 60 * 60 * 1000));

    const hh = String(tokyo.getHours()).padStart(2, "0");
    const mm = String(tokyo.getMinutes()).padStart(2, "0");
    const ss = String(tokyo.getSeconds()).padStart(2, "0");


    return `${hh}:${mm}:${ss}`;
}


/**
 * 
 * @param {Player} player 
 * @param {string} actionbarText 
 * @param {string[]} siderbarTextArray 
 */
export function showText(player, actionbarText, siderbarTextArray) {

    //70文字なるように空白を追加
    const cnt = 70 - getByte(actionbarText);

    let txt = ``;
    for(let i=0; i<cnt; i++) {
        if(i == Math.floor(cnt/2))txt = txt + actionbarText;
        txt = txt + " ";
    };
    txt = txt + siderbarTextArray.join(`\n§r`);

    player.onScreenDisplay.setActionBar(txt);
};

/**
 * @param {string} string 
 * @returns 
 */
export function getByte(string) {
    var l = 0;
    for(var i=0; i<string.length; i++) {
        var c = string.charCodeAt(i);
        if(string[i] == `§` || (c >= 0x0 && c < 0x81) || (c === 0xf8f0) || (c >= 0xff61 && c < 0xffa0) || (c >= 0xf8f1 && c < 0xf8f4)) {
            l += 1;
            if(string[i-1] == `§`)l += 1;
        }else {
            l += 3;
        };
    };
    return l;
};

/**
 * @param {number} number1
 * @param {number} number2 
 * @param {boolean} isFloor 
 * @returns {number}
 */
export function random(number1, number2, isFloor) {
    const max = Math.max(...[number1, number2]);
    const min = Math.min(...[number1, number2]);

    if(isFloor){
        return Math.floor(Math.random() * (max + 1 - min)) + min;
    }else{
        return min + (max-min) * Math.random();
    };
};

/**
 * @param {number} angleY 
 * @returns {Vector3}
 */
export function angleToVector(angleY) {
    const d = -(angleY);
    const radian = d * (Math.PI / 180);
    const x = Math.cos(radian) * 1;
    const z = Math.sin(radian) * 1;
  
    return { x:z, y:0, z:x };
};


/**
 * @param {Entity} entity 
 * @param {string} id 
 * @param {number} maxTryCount 
 * @returns {EntityComponent}
 */
async function getComponentAsync(entity, id, maxTryCount) {
	const __maxTryCount__ = maxTryCount ?? 20;

	let component;
	for(let i=0; i<__maxTryCount__; i++) {
		component = entity.getComponent(id);
		if(component)return component;

		await system.waitTicks(1);
	}

	return;
}

/**
 * 
 * @param {Player} player 
 * @param { {t:string,n:number}[] } array
 */
export function setSidebar(player, array) {
    if(array.length == 0)return;
    
    const title = "情報"
    
    array.sort((a, b) => b.n - a.n);
    const texts = array.map(d => { return d.t; }).join("\n§f");

    player.onScreenDisplay.setActionBar(title + texts);
}


export class Util {

    //==================================================
    /**
     *  チャットに値を出力します
     * @param {*} arg 
     * @param {boolean} organize 値を整頓して表示する
     * @returns 
     */
    static log(arg, organize) {
        log(arg, organize);
    };
    
    /**
     * 値をディープコピーして、返します
     * @param {any} arg 
     * @returns {any}
     */
    static deepCopy(arg) {
        return JSON.parse(JSON.stringify(arg));
    };

    static replMc(id) {
        return id.replace("minecraft:", "");
    }
    //==================================================



    //==================================================
    /**
     * 値がVector3型か否かを返します
     * @param {ary} arg 
     * @returns {boolean}
     */
    static isVector3(arg) {
        if(arg?.x != undefined && arg?.y != undefined && arg?.z != undefined)return true;
        return false;
    }

    /**
     * 値がVector2型か否かを返します
     * @param {ary} arg 
     * @returns {boolean}
     */
    static isVector2(arg) {
        if(arg?.x != undefined && arg?.y != undefined && arg?.z == undefined)return true;
        return false;
    }

    /**
     * プレイヤーがサバイバルか否かを返します
     * @param {Player} player
     * @returns {boolean} 
     */
    static isSurvival(player) {
        if(player.getGameMode() == "Survival")return true;
        return false;
    }

    /**
     * プレイヤーがクリエイティブか否かを返します
     * @param {Player} player
     * @returns {boolean} 
     */
    static isCreative(player) {
        if(player.getGameMode() == "Creative")return true;
        return false;
    }

    /**
     * プレイヤーがアドベンチャーか否かを返します
     * @param {Player} player
     * @returns {boolean} 
     */
    static isAdventure(player) {
        if(player.getGameMode() == "Adventure")return true;
        return false;
    }

    /**
     * プレイヤーがスペクテイターか否かを返します
     * @param {Player} player
     * @returns {boolean} 
     */
    static isSpectator(player) {
        if(player.getGameMode() == "Spectator")return true;
        return false;
    }

    /**
     * プレイヤーの入力しているベクトルを返します
     * @param {Player} player 
     * @returns {Vector3}
     */
    static getInputVector(player) {
        //入力キーを移動方向ベクトルに変換
        const rawVec = player.inputInfo.getMovementVector();//入力キーのvec2 > Z軸:x, X軸:y
        const viewVec = player.getViewDirection();//向いてる方向:vec3
        const offSet = Vector.offsetDirct(player.location, { x:rawVec.x, y:0, z:rawVec.y }, viewVec)
        const inputVector = Vector.normalize(Vector.subtract(offSet, player.location));

        return inputVector;
    }

    /**
     * 
     * @param {Player} player 
     * @param {string} itemId 
     */
    static getHasItemCount(player, itemId) {
        let cnt = 0;
        const container = player.getComponent("inventory").container;
        for(let i=0; i<container.size; i++) {
            const itemStack = container.getItem(i);
            if(!itemStack || itemStack.typeId != itemId)continue;

            cnt += itemStack.amount;
        }

        return cnt;
    }

    /**
     * @param {Player} player 
     */
    static clearInventory(player) {
        const container = player.getComponent("inventory").container;
        for(let i=0; i<container.size; i++) {
            container.setItem(i);
        }

        const equipCopm = player.getComponent("equippable");
        equipCopm.setEquipment("Head");
        equipCopm.setEquipment("Chest");
        equipCopm.setEquipment("Legs");
        equipCopm.setEquipment("Feet");
        equipCopm.setEquipment("Offhand");

        const cursorComp = player.getComponent("cursor_inventory");
        cursorComp.clear();
    }

    /**
     * 
     * @param {Player} player
     * @returns {ItemStack[]}
     */
    static getAllItemStack(player) {
        let list = [];

        const container = player.getComponent("inventory").container;
        for(let i=0; i<container.size; i++) {
            const itemStack = container.getItem(i);
            if(itemStack)list.push(itemStack);
        }

        const equipCopm = player.getComponent("equippable");
        if(equipCopm.getEquipment("Head"))list.push(equipCopm.getEquipment("Head"));
        if(equipCopm.getEquipment("Chest"))list.push(equipCopm.getEquipment("Chest"));
        if(equipCopm.getEquipment("Legs"))list.push(equipCopm.getEquipment("Legs"));
        if(equipCopm.getEquipment("Feet"))list.push(equipCopm.getEquipment("Feet"));

        const cursorComp = player.getComponent("cursor_inventory");
        const cursorItem = cursorComp.item;
        if(cursorItem)list.push(cursorItem);

        return list;
    }

    /**
     * @param {Player} player 
     */
    static clearEffect(player) {
        for(const effectType of EffectTypes.getAll()) {
            player.removeEffect(effectType);
        }
    }

    static isPlyaer(entity) {
        return entity?.typeId == "minecraft:player";
    }

}

