import {Vector3, AxesViewer, MeshBuilder, StandardMaterial, Color3} from '@babylonjs/core';
import {GlobalManager} from './GlobalManager.js';
import {SceneLoader} from '@babylonjs/core/Loading/sceneLoader';
import {ArcRotateCamera, Mesh, Quaternion, Ray} from "babylonjs";
import Object3D from './Object3D.js';
import {DEBUG_MODE} from "./Game.js";

const pathplanetGLB = "./src/game/assets/";
const planetGLB = "planetB.glb";

class Planet extends Object3D{
    //attributes
    meshPlanet;
    radius;
    gravity;
    gravityFieldRadius;
    position = new Vector3(0,0,0);

    name = "planet";

    constructor(radius,gravity,position){
        super();
        this.radius = radius
        this.gravityFieldRadius = radius * 3;
        this.gravity = gravity
        this.position = position
    }

    async init(){
        
        const planet = await this.loadGLB(pathplanetGLB,planetGLB);
        this.meshPlanet = planet;
        this.meshPlanet.name = this.name;
        for(let i = 0; i < this.meshPlanet.getChildren().length; i++){
            this.meshPlanet.getChildren()[i].checkCollisions = true;
            //this.meshPlanet.getChildren()[i].isPickable = true;
            this.meshPlanet.getChildren()[i].name = this.name;
        }
        if(DEBUG_MODE){
            this.setAxisDebug();
        }
        this.setPosition(this.position);
        this.setScale(new Vector3(this.radius,this.radius,this.radius));
        
        //create sphere
        //this.mesh = MeshBuilder.CreateSphere("planet",{diameter : this.radius * 2},GlobalManager.scene)
        //this.mesh.position = this.position;
        //this.mesh.checkCollisions = true;
        
        //create Cube
        //this.mesh = MeshBuilder.CreateBox("cubePlanet", { size: 20 }, GlobalManager.scene);
        //this.mesh.position = this.position;
        //this.mesh.checkCollisions = true;
        
        //create cylinder
        //this.mesh = MeshBuilder.CreateCylinder("cylinder", {diameterTop: 30, diameterBottom: 30, height: 30}, GlobalManager.scene);
        //this.mesh.position = this.position;
        //this.mesh.checkCollisions = true;

        //const gravityField = MeshBuilder.CreateSphere("gravityField", { diameter: this.gravityFieldRadius }, GlobalManager.scene);
        //gravityField.parent = this.mesh;

        // Create a transparent material for the gravity field
        //const gravityMaterial = new StandardMaterial("gravityMat", GlobalManager.scene);
        //gravityMaterial.alpha = 0; // Transparency
        //gravityField.material = gravityMaterial;

        //add shadow
        //GlobalManager.addShadowCaster(this.mesh, true);
    }

    rotate(){
        let rotationDelta = 0.2 * GlobalManager.deltaTime;
        let rotationQuaternion = Quaternion.RotationAxis(new Vector3(0,1,0),rotationDelta);
        this.meshPlanet.rotationQuaternion = this.meshPlanet.rotationQuaternion.multiply(rotationQuaternion);
    }

    update(){
        this.rotate();
        
    }


}
export default Planet;


