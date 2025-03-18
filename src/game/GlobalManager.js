import {} from '@babylonjs/core';


class GlobalManager {
   
    engine;
    canvas;
    scene;
    
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
   
   lightTranslation(light,translation){
          
   }
}

const {instance} = GlobalManager;
export {instance as GlobalManager};