
import {} from '@babylonjs/core';


class CameraManager {
    
    scene;
    cameras = [];


    constructor() {

   }
   
   //singleton
   static get instance() {
        return (globalThis[Symbol.for(`PF_${CameraManager.name}`)] || new this());    
   }

   init(){
        
   }

   update(){
    
   }

}

const {instance} = CameraManager;
export {instance as CameraManager};