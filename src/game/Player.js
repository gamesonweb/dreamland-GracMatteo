import {Vector3,AxesViewer,MeshBuilder,StandardMaterial,Color3} from '@babylonjs/core';
import {} from '@babylonjs/loaders/glTF';
import {DEBUG_MODE} from "./Game.js"

const SPEED = 5;
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
    this.mesh.material.diffuseColor = new Color3(0 , 1, 0);  
    this.mesh.position = new Vector3(3 ,0.5,3 );
    if(DEBUG_MODE){
        //axies pour debug
      this.axies = new AxesViewer(this.scene, 1)
      this.axies.xAxis.parent = this.mesh;
      this.axies.yAxis.parent = this.mesh;
      this.axies.zAxis.parent = this.mesh;
    }
      
  }

  update(delta ,inputMap, actions){
    //console.log("input in update :"+inputMap)
    this.getInputs(delta,inputMap,actions);
    //console.log("delta time ="+delta)
    this.move();
  }
  //faire un InputManager
  getInputs(delta,inputMap,actions){
    
    //console.log("inputmap in getInput :"+inputMap);
    if(inputMap["KeyA"]){
      this.mesh.position.x -= SPEED * delta
      //consol.log("mesh position X :"+ this.mesh.position.x) 
    }
    
    if (inputMap["KeyD"]){
      this.mesh.position.x += SPEED * delta
    }

    if(inputMap["KeyW"]){
      this.mesh.position.z += SPEED * delta
    }
    
    if(inputMap["KeyS"]){
      this.mesh.position.z -= SPEED * delta
    }
  
  }

  move(){

  }
}

export default Player;