import {Vector3,AxesViewer,MeshBuilder,StandardMaterial,Color3} from '@babylonjs/core';
import {} from '@babylonjs/loaders/glTF';


import {getForwardVector, getRightVector} from "./getDirectionMesh.js";

import {DEBUG_MODE} from "./Game.js"
import { ArcRotateCamera } from 'babylonjs';

const SPEED = 5;
//import MeshUrl from './src/game/assets/angryAntoine.glb';

class Player{
  
  mesh;
  shadow;
  
  cene;
  camera;
  axies;

  //vecteur d'input
  moveInput = new Vector3(0,0,0);
  //vecteur de déplacement 
  moveDirection = new Vector3(0,0,0);

  constructor(scene){
    this.scene = scene;

    this.init();
  }

  init(){
    
    //mesh player
    this.mesh = MeshBuilder.CreateBox("playerMesh", {size: 1});
    this.mesh.material = new StandardMaterial("playerMaterial", this.scene);
    this.mesh.material.diffuseColor = new Color3(0 , 1, 0);  
    this.mesh.position = new Vector3(3, 0.5, 3);
    
    this.camera = new ArcRotateCamera("playerCamera",
      -Math.PI/2,       
      3*Math.PI/10,       
      10,                
      this.mesh.position, 
      this.scene
    );

    // Activer les contrôles de la caméra avec la souris
    this.camera.attachControl(this.scene.getEngine().getRenderingCanvas(), true);



    this.applyCameraToInput();
    //this.camera.setTarget(this.mesh.position);
    

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
    this.getInputs(inputMap,actions);
    this.applyCameraToInput();
    //console.log("delta time ="+delta)
    this.move(delta);
  }
  
  //faire un InputManager
  getInputs(inputMap,actions){
    
    this.moveInput.set(0,0,0);
    //console.log("inputmap in getInput :"+inputMap);
    if(inputMap["KeyA"]){
      this.moveInput.x = -1;
      //consol.log("mesh position X :"+ this.mesh.position.x) 
    }
    
    if (inputMap["KeyD"]){
      this.moveInput.x = 1;
    }

    if(inputMap["KeyW"]){
      this.moveInput.z = 1;
    }
    
    if(inputMap["KeyS"]){
      this.moveInput.z = -1;
    }
    
  }

  applyCameraToInput(){
    
    this.moveDirection.set(0, 0, 0);
    
    if(this.moveInput.length() !== 0){
      
      //recuperer le forward de la camera
      let forward = getForwardVector(this.camera,true);
      //reset Y
      forward.y = 0;
      //normaliser
      forward.normalize();
      forward.scaleInPlace(this.moveInput.z);
      
      //recuperer le forward de la camera
      let right = getRightVector(this.camera,true);
      //reset Y
      right.y = 0;
      //normaliser
      right.normalize();
      right.scaleInPlace(this.moveInput.x);
      
      //add les 2 vecteurs
      this.moveDirection = right.add(forward);
      this.moveDirection.normalize();

    }  
  }

  move(delta){
    
    //check si il y a un vecteur d'input 
    if(this.moveDirection.length() != 0){
      
      this.moveDirection.scaleInPlace(SPEED * delta);
      
      this.mesh.position.addInPlace(this.moveDirection);
    
    }
    this.camera.target = this.mesh.position;
  }


}

export default Player;