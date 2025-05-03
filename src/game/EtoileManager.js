import '@babylonjs/loaders';
import Object3D from './Object3D';
import {GlobalManager} from './GlobalManager.js';
import {Vector3} from '@babylonjs/core';
import { Quaternion, Vector4 } from 'babylonjs';
import {DEBUG_MODE} from "./Game.js";
import Etoile from './Etoile.js';

const MAX_ETOILES = 10; // Maximum number of stars

class EtoileManager {
    
    etoiles = []; // Array to hold the stars

    constructor() {
        
    }

    async init() {
        for (let i = 0; i < MAX_ETOILES; i++) {
            const etoile = new Etoile(new Vector3(Math.random() * 20, Math.random() * 20, Math.random() * 20));
            await etoile.init();
            this.etoiles.push(etoile);
        }    
    }

    spawn(){

    }
    
    update() {
        for (let i = 0; i < this.etoiles.length; i++) {
            this.etoiles[i].update();
        }
    }


}export default EtoileManager;
    