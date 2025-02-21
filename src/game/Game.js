// Import the necessary modules
import * as BABYLON from '@babylonjs/core/Legacy/legacy';
 export default class Game {
    
    constructor(canvas) {
        this.canvas = canvas;
        this.engine = new BABYLON.Engine(this.canvas,true);
        this.scene = new BABYLON.Scene(this.engine);
        this.camera;
        this.light;   
    }    


    async init() {
        this.createScene();
        this.addCamera();
    
        // On attend 500ms pour être sûr que tout est prêt
        await new Promise((resolve) => setTimeout(resolve, 500));  
    }
    
    
    createScene() {
        this.scene.clearColor = new BABYLON.Color3(0.8, 0.8, 0.8);
        BABYLON.Mesh.CreateGround("ground", 6, 6, 2, this.scene);
        this.light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, 1, 0), this.scene);
        
        
    }
    
    addCamera() {
        this.camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0, 5, -10), this.scene);
        this.camera.setTarget(BABYLON.Vector3.Zero());
        this.camera.attachControl(this.canvas, true);
    }
    
    start() {
        this.engine.runRenderLoop(() => {
            this.scene.render();
        });
    }
}