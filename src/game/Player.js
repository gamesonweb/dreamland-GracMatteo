import {Vector3,AxesViewer,MeshBuilder,StandardMaterial,Color3} from '@babylonjs/core';
import {} from '@babylonjs/loaders/glTF';


//import MeshUrl from './src/game/assets/angryAntoine.glb';

class Player{
  
  mesh;
  
  scene;
  camera;
  axies;

  shadow;

  constructor(camera,scene){
    this.scene = scene;
    this.camera = camera;
    this.init();
  }

  init(){
    
    //mesh player
    this.mesh = MeshBuilder.CreateBox("playerMesh", {size: 1});
    this.mesh.material = new StandardMaterial("playerMaterial", this.scene);
    this.mesh.material.diffuseColor = new Color3(0, 1, 0);  
    this.mesh.position = new Vector3(3,1,3);
    
    //axies pour debug
    this.axies = new AxesViewer(this.scene, 1)
    this.axies.xAxis.parent = this.mesh;
    this.axies.yAxis.parent = this.mesh;
    this.axies.zAxis.parent = this.mesh;
  
  }

  update(delta){
    this.getInputs();
    this.move();
  }

  getInputs(){
    
  }

  move(){

  }
}

export default Player;