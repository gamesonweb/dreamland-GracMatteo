import {Vector3, AxesViewer, MeshBuilder, StandardMaterial, Color3} from '@babylonjs/core';
import {GlobalManager} from './GlobalManager.js';
import {SceneLoader} from '@babylonjs/core/Loading/sceneLoader';
import {ArcRotateCamera, Quaternion, Ray} from "babylonjs";

class Planet {
    //attributes
    mesh;
    radius;
    gravity;
    radiusGravitation;
    position = new Vector3(0,0,0);

    constructor(radius,gravity,position){
        this.radius = radius
        this.gravity = gravity
        this.position = position
    }

    async init(){
        //create sphere
        //this.mesh = MeshBuilder.CreateSphere("planet",{diameter : this.radius * 2},GlobalManager.scene)
        //this.mesh.position = this.position;
        //this.mesh.checkCollisions = true;
        
        //create Cube marche pas
        this.mesh = MeshBuilder.CreateBox("cubePlanet",{size: 10},GlobalManager.scene)
        this.mesh.position = this.position
        this.mesh.checkCollisions = true;
        //add shadow
        GlobalManager.addShadowCaster(this.mesh, true);
    }

    update(){

    }


}
export default Planet;


