import '@babylonjs/loaders';
import Object3D from './Object3D';


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

    init(){
        this.mesh = this.loadGLB(pathEtoileGLB,etoileGLB).then(() => {
            this.setPosition(this.position);
            this.mesh.name = this.name;
        });
        
    }

    update(){
        
    }


}export default Etoile;