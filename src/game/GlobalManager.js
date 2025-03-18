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
        this.lightRotation(0.01);
        //this.lightTranslation();
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
   
   removeLight(light){
     this.lights.pop(light);        
   }
   lightRotation(angleRotation){
     this.sunAngle += angleRotation * this.deltaTime; 
     const sunDirection = new Vector3(Math.sin(this.sunAngle), -Math.cos(this.sunAngle), 0);
     this.lights[0].direction = sunDirection;
   }

   lightTranslation(){
     this.sunTranslation += 0.1 * this.deltaTime; 
     const sunTranslation = new Vector3(this.sunTranslation,-10, 0);
     this.lights[0].position = sunTranslation;
   }

}

const {instance} = GlobalManager;
export {instance as GlobalManager};