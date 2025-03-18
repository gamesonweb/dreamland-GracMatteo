import {Vector3} from '@babylonjs/core';


class GlobalManager {
   
    engine;
    canvas;
    scene;
    sunAngle = 0;
    camera = []; 
    lights = [];
    shadowGenerators = [];

    deltaTime;
    constructor() {
          
   }
   
   //singleton
   static get instance() {
        return (globalThis[Symbol.for(`PF_${GlobalManager.name}`)] || new this());    
   }

   init(engine,canvas){
        this.canvas = canvas;
        this.engine = engine;
   }

   update(){
        this.deltaTime = this.engine.getDeltaTime() / 1000.0;
        // Update the sun's direction to simulate movement
        this.lightTranslationSun();
        //GlobalManager.lightTranslation(); 
   }

   addShadowGenerator(shadowGen){
        this.shadowGenerators.push(shadowGen);
   }

   addShadowCaster(object,bChilds){
        bChilds = bChilds || false;
        for(let shad of this.shadowGenerators){
            shad.addShadowCaster(object,bChilds);
        }
   }

   addLight(light){
        this.lights.push(light);
   }
   
   lightTranslationSun(){
     this.sunAngle += 0.01 * this.deltaTime; // Adjust the speed of the sun's movement
     const sunDirection = new Vector3(Math.sin(this.sunAngle), -Math.cos(this.sunAngle), 0);
     this.lights[0].direction = sunDirection;
   }

}

const {instance} = GlobalManager;
export {instance as GlobalManager};