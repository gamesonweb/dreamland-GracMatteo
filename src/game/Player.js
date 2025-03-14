import {Vector3,AxesViewer,MeshBuilder,StandardMaterial,Color3} from '@babylonjs/core';
import {} from '@babylonjs/loaders/glTF';

const SPEED_X = 5;
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

  update(delta ,inputMap, actions){
    //console.log("input in update :"+inputMap)
    this.getInputs(delta,inputMap,actions);
    //console.log("delta time ="+delta)
    this.move();
  }

  getInputs(delta,inputMap,actions){
    //console.log("inputmap in getInput :"+inputMap);
    if(inputMap["KeyA"]){
      this.mesh.position.x -= SPEED_X * delta
      //consol.log("mesh position X :"+ this.mesh.position.x) 
    }
    
    if (inputMap["KeyD"]){
      this.mesh.position.x += SPEED_X * delta
    }

  }

  move(){

  }
}

export default Player;