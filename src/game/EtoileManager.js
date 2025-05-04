import '@babylonjs/loaders';
import Object3D from './Object3D';
import {GlobalManager} from './GlobalManager.js';
import {Vector3} from '@babylonjs/core';
import { Quaternion, Vector4 } from 'babylonjs';
import {DEBUG_MODE} from "./Game.js";
import Etoile from './Etoile.js';

const MAX_ETOILES = 10; // Maximum number of stars

class EtoileManager {
    
    currentPlanet = null; // Current planet
    
    etoiles = []; // Array to hold the stars

    constructor() {
        
    }

    async init(planet) {
        
        this.currentPlanet = planet; // Set the current planet
        //console.log("EtoileManager initialized with planet:", this.currentPlanet);
        
        const minOffset = 1;
        const maxOffset = 3;
        
        

        const spawnEtoile = async () => {
            if (this.etoiles.lenght >= MAX_ETOILES) return;
            
            let dir = new Vector3(
                Math.random() * 2 - 1, // Random x direction
                Math.random() * 2 - 1, // Random y direction
                Math.random() * 2 - 1  // Random z direction
            ).normalize(); // Normalize the direction vector
            
            const distance = 
                (this.currentPlanet.radius - 20) +
                minOffset +
                Math.random() * (maxOffset - minOffset); // Random distance from the planet
    
            const spawnPos = this.currentPlanet.position.add(dir.scale(distance)); // Calculate the spawn position

            const etoile = new Etoile(spawnPos);
            await etoile.init();
            this.etoiles.push(etoile);

            const timeNextSpawn = Math.random() * 1000 + 500; // Random time between 0.5 and 1.5 seconds
            setTimeout(spawnEtoile, timeNextSpawn); // Create a new star every 0.5 to 1.5 seconds
        }

        spawnEtoile();

    }

    async popEtoile() {
        this.etoiles.forEach(etoile => {
            if(etoile.meshEtoile.scaling.x < 0.1) {
                this.etoiles.splice(this.etoiles.indexOf(etoile), 1);
                etoile.meshEtoile.dispose(); // Dispose of the mesh to free up memory
            }

        });
    }

    update() {
        for (let i = 0; i < this.etoiles.length; i++) {
            this.etoiles[i].update();
            this.popEtoile();
            
        }
        
        console.log("etoiles",this.etoiles.length);
    }


}export default EtoileManager;
    