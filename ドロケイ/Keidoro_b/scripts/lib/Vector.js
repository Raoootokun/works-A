//==================================================
// v1.0.0 / 2026/01/23
//==================================================

export class Vector {
    static zero = { x:0, y:0, z:0 };

    /**
     * @param {number} x 
     * @param {number} y 
     * @param {number} z 
     * @returns {Vec3}
     */
    static create(x, y, z){
        return { x, y, z };
    };

    /**
     * @param {Vec3} vector 
     * @returns {Vec3}
     */
    static copy(vector) {
        return { x:vector.x, y:vector.y, z:vector.z };
    };

    /**
     * @param {Vec3} vector
     * @param {Vec3|number} value
     * @returns {Vec3}
     */
    static add(vector, value) {
        const copyVector = Vector.copy(vector);
        if(typeof value === "number"){
            return { x: copyVector.x + value, y: copyVector.y + value, z: copyVector.z + value, };
        }else{
            return { x: copyVector.x + value.x, y: copyVector.y + value.y, z: copyVector.z + value.z, };
        };
    };

    /**
     * @param {Vec3} vector 
     * @param {Vec3|number} value 
     * @returns {Vec3}
     */
    static subtract(vector, value) {
        const copyVector = Vector.copy(vector);
        if(typeof value === "number"){
            return { x: copyVector.x - value, y: copyVector.y - value, z: copyVector.z - value, };
        }else{
            return { x: copyVector.x - value.x, y: copyVector.y - value.y, z: copyVector.z - value.z, };
        };
    };

    /**
     * @param {Vec3} a 
     * @param {Vec3|number} b 
     * @returns {Vec3}
     */
    static multiply(a, b) {
        const vector = Vector.copy(a);
        if(typeof b === "number"){
            return { x: vector.x * b, y: vector.y * b, z: vector.z * b, };
        }else{
            return { x: vector.x * b.x, y: vector.y * b.y, z: vector.z * b.z, };
        }
    };

    /**
     * @param {Vec3} a 
     * @param {Vec3|number} b 
     * @returns {Vec3}
     */
    static divide(a, b) {
        const vector = Vector.copy(a);
        if(typeof b === "number"){
            return { x: vector.x / b, y: vector.y / b, z: vector.z / b, };
        }else{
            return { x: vector.x / b.x, y: vector.y / b.y, z: vector.z / b.z, };
        };
    };

    /**
     * @param {Vec3} vector 
     * @returns {number}
     */
    static length(vector) {
        return Math.sqrt(vector.x*vector.x + vector.y*vector.y + vector.z*vector.z);
    };

    /**
     * @param {Vec3} vector 
     * @returns {Vec3}
     */
    static normalize(vector) {
        return this.multiply(vector, 1 / this.length(vector));
    };

    /**
     * @param {Vec3} vector 
     * @param {number} length 
     * @returns {Vec3}
     */
    static setMag(vector, length) {
        const nv = this.normalize(vector);
        nv.x *= length;
        nv.y *= length;
        nv.z *= length;
        return nv;
    };

    /**
     * @param {Vec3} vector 
     * @returns {Vec2}
     */
    static heading(vector) {
        const x = Math.atan(vector.y, vector.z);
        const y = Math.atan(0, vector.z+vector.x);
        return { x:x, y:y };
    };

    /**
     * @param {Vec3} fromVector 
     * @param {Vec3} toVector 
     * @returns {number}
     */
    static distance(fromVector, toVector) {
        return Math.sqrt(((fromVector.x-toVector.x)**2) + ((fromVector.y-toVector.y)**2) + ((fromVector.z-toVector.z)**2));
    };


    /**
     * @param {Vec3} vector 
     * @returns {Vec3}
     */
    static floor(vector) {
        const copyVector = Vector.copy(vector);
        return {
            x: Math.floor(copyVector.x),
            y: Math.floor(copyVector.y),
            z: Math.floor(copyVector.z),
        };
    };

    /**
     * @param {Vec3} vector 
     * @returns {Vec3}
     */
    static round(vector) {
        const copyVector = Vector.copy(vector);
        return {
            x: Math.round(copyVector.x),
            y: Math.round(copyVector.y),
            z: Math.round(copyVector.z),
        }; 
    };

    /**
     * @param {Vec3} vector 
     * @returns {Vec3}
     */
    static ceil(vector) {
        const copyVector = Vector.copy(vector);
        return {
            x: Math.ceil(copyVector.x),
            y: Math.ceil(copyVector.y),
            z: Math.ceil(copyVector.z),
        }; 
    };

    

    /** 
     * @param {Vec3} object
     * @returns {Vec3} 
     */
    static from(object, map = (vec) => vec) {
        return map(object);
    };

    /**
     * @param {Vec3} a 
     * @param {Vec3} b 
     * @returns {Vec3}
     */
    static cross(a, b) {

        return {
            x: a.y * b.z - a.z * b.y,
            y: a.z * b.x - a.x * b.z,
            z: a.x * b.y - a.y * b.x
        };
        /*return ((a, b) => ({
            x: a.y * b.z - a.z * b.y, 
            y: a.z * b.x - a.x * b.z, 
            z: a.x * b.y - a.y * b.x
        }))(this.from(a), this.from(b));*/
    };

    /**
     * @param {Vec3} vaseVec 
     * @param {Vec3} offsetVec 
     * @param {Vec3} direVec 
     * @returns {Vec3}
     */
    static offsetDirct(vaseVec, offsetVec, direVec) {
        const { x, y, z } = offsetVec;
        const zVec = this.from(direVec);
        const xVec = this.normalize({ x:zVec.z, y:0, z:-zVec.x });
        const yVec = this.normalize(this.cross(zVec, xVec));
        return this.add(this.add(this.add(vaseVec, this.multiply(xVec, x)), this.multiply(yVec, y)), this.multiply(zVec, z));
    };

    static dot(a, b) {
        return a.x*b.x + a.y*b.y + a.z*b.z;
    };

    /**
     * @param {Vec3} vector 
     * @param {number} x 
     * @returns 
     */
    static addsX(vector, x) {
        const copyVector = Vector.copy(vector);
        copyVector.x += x;
        return copyVector;
    };

    /**
     * @param {Vec3} vector 
     * @param {number} y 
     * @returns 
     */
    static addsY(vector, y) {
        const copyVector = Vector.copy(vector);
        copyVector.y += y;
        return copyVector;
    };

    /**
     * @param {Vec3} vector 
     * @param {number} z 
     * @returns 
     */
    static addsZ(vector, z) {
        const copyVector = Vector.copy(vector);
        copyVector.z += z;
        return copyVector;
    };
};

