import '@babylonjs/loaders';
import Object3D from './Object3D';
import {GlobalManager} from './GlobalManager.js';
import {Vector3} from '@babylonjs/core';


const pathEtoileGLB = "./src/game/assets/";
const etoileGLB = "etoile.glb";

class Etoile extends Object3D{
    mesh;
    position;
    name = "etoile";
    constructor(position){
        super();
        this.position = position;
        
    }

    async init(){
        this.mesh = await this.loadGLB(pathEtoileGLB,etoileGLB).then(() => {
            this.setPosition(this.position);
            this.mesh.name = this.name;
        });
        
    }

    scaleDown(shrinkFactor){
        let shrinkFactorDelta;
        let vectFactor;

        shrinkFactorDelta = shrinkFactor * GlobalManager.deltaTime;
        vectFactor  = new Vector3(shrinkFactorDelta,shrinkFactorDelta,shrinkFactorDelta);
        this.mesh.scaling = this.mesh.scaling.subtract(vectFactor);
    }
    
    update(){
        this.scaleDown(0.07);
    }

}export default Etoile;