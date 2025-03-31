import {Vector3,AxesViewer,MeshBuilder,StandardMaterial,Color3} from '@babylonjs/core';

import { SceneLoader } from '@babylonjs/core/Loading/sceneLoader';
import '@babylonjs/loaders';  // This registers all additional loaders like GLTF, OBJ, etc.


import {getForwardVector, getRightVector,getUpVector} from "./getDirectionMesh.js";
import {ArcRotateCamera, Quaternion} from "babylonjs"
import {DEBUG_MODE} from "./Game.js"
import { GlobalManager } from './GlobalManager.js';

//import { SceneLoader } from '@babylonjs/Loading/sceneLoader';

const SPEED = 5;
const SPEED_ROTATION = 5;

const pathPlayerGLB = "./src/game/assets/";
const PlayerGLB = "angryAntoine.glb"; 

class Player{
  
  mesh;
  shadow;
  
  scene;
  camera;
  axies;

  //vecteur d'input
  moveInput = new Vector3(0,0,0);
  //vecteur de déplacement 
  moveDirection = new Vector3(0,0,0);

  lookDirectionQuaternion = new Quaternion.Identity();

  constructor(){
  
  }

  async init(){
    
    //mesh player
    //this.mesh = MeshBuilder.CreateBox("playerMesh", {size: 1});
    //this.mesh.material = new StandardMaterial("playerMaterial", GlobalManager.scene);
    //this.mesh.material.diffuseColor = new Color3(0 , 1, 0);  
    //this.mesh.position = new Vector3(3, 0.5, 3);
    
    
    const result = await SceneLoader.ImportMeshAsync("",pathPlayerGLB,PlayerGLB,GlobalManager.scene);
    this.mesh = result.meshes[0];
    this.mesh.position = new Vector3(1, 0.5, 1);
    this.mesh.ellipsoid = new Vector3(0.5,0.5,0.5);
    const offsetY = 0.0;
    this.mesh.ellipsoidOffset = new Vector3(0, offsetY, 0);

    this.mesh.checkCollisions = true;
    //this.mesh.rotation = new Vector3(0,Math.PI,0);
    this.mesh.rotationQuaternion = Quaternion.Identity();
    //this.mesh
    if (DEBUG_MODE){
      this.createEllipsoidLines(this.mesh.ellipsoid.x, this.mesh.ellipsoid.y);
    }
    
    let camera = new ArcRotateCamera("playerCamera",
      -Math.PI/2,       
      3*Math.PI/10,       
      10,                
      this.mesh.positsion, 
      GlobalManager.scene
    );
    GlobalManager.camera = camera;
    
    
    GlobalManager.addShadowCaster(this.mesh,true);
    
    /*
    GlobalManager.camera = ArcRotateCamera("playerCamera",
      -Math.PI/2,       
      3*Math.PI/10,       
      10,                
      this.mesh.position, 
      GlobalManager.scene
    );
    */
    // Activer les contrôles de la caméra avec la souris
    GlobalManager.camera.attachControl(GlobalManager.engine.getRenderingCanvas(), true);

    

    this.applyCameraToInput();
    //GlobalManager.camera.setTarget(this.mesh.position);
    

    if(DEBUG_MODE){
      //axies pour debug
      this.axies = new AxesViewer(GlobalManager.scene, 1)
      this.axies.xAxis.parent = this.mesh;
      this.axies.yAxis.parent = this.mesh;
      this.axies.zAxis.parent = this.mesh;
    }
      
  }

  update(inputMap, actions){
    //console.log("input in update :"+inputMap)
    this.getInputs(inputMap,actions);
    this.applyCameraToInput(inputMap);
    //console.log("delta time ="+delta)
    this.move(GlobalManager.deltaTime);
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
    
    if(inputMap[" "]){
      this.moveInput.y = 1;
    }

    // Handle gamepad input (Left stick) on utilise Math.abs pour gerer les valeurs residuelles
    if (inputMap["leftStickX"] !== undefined && Math.abs(inputMap["leftStickX"]) > 0.15) {
      console.log("inputMap leftStickX :"+inputMap["leftStickX"])
      this.moveInput.x = inputMap["leftStickX"];
    }
    if (inputMap["leftStickY"] !== undefined && Math.abs(inputMap["leftStickY"]) > 0.15) {
      console.log("inputMap leftStickY :"+inputMap["leftStickY"])
      this.moveInput.z = -inputMap["leftStickY"];
    }
    //handle gamepad input (right stick)
    if (inputMap["rightStickX"] !== undefined && Math.abs(inputMap["rightStickX"]) > 0.15) {
        GlobalManager.camera.alpha -= inputMap["rightStickX"]  * GlobalManager.deltaTime;
    }
    if (inputMap["rightStickY"] !== undefined && Math.abs(inputMap["rightStickY"]) > 0.15) {
        GlobalManager.camera.beta -= inputMap["rightStickY"]  * GlobalManager.deltaTime;
    }
  }
  
  applyCameraToInput(){
    
    this.moveDirection.set(0, 0, 0);
    
    if(this.moveInput.length() !== 0){
      
      //recuperer le forward de la camera
      let forward = getForwardVector(GlobalManager.camera,true);
      //reset Y
      forward.y = 0;
      //normaliser
      forward.normalize();
      forward.scaleInPlace(this.moveInput.z);
      
      //recuperer le forward de la camera
      let right = getRightVector(GlobalManager.camera,true);
      //reset Y
      right.y = 0;
      //normaliser
      right.normalize();
      right.scaleInPlace(this.moveInput.x);
      
      //essai de mettre un saut
      let up = getUpVector(GlobalManager.camera,true)

      //add les 2 vecteurs
      this.moveDirection = right.add(forward);
      this.moveDirection.normalize();

      Quaternion.FromLookDirectionLHToRef(
        this.moveDirection, 
        Vector3.UpReadOnly,
        this.lookDirectionQuaternion)
      }  

    // Handle right stick input for camera rotation
    
  }

  move(){
    
    if (!this.mesh) return;
    //check si il y a un vecteur d'input 
    if(this.moveDirection.length() != 0){
      
      //permet de positionner le mesh dans la direction calculer
      //this.mesh.lookAt(this.mesh.position.add(this.moveDirection));

      //permet de positionner le mesh dans la bonne direction  
      Quaternion.SlerpToRef(
        this.mesh.rotationQuaternion ,
        this.lookDirectionQuaternion,
        SPEED_ROTATION * GlobalManager.deltaTime, 
        this.mesh.rotationQuaternion)

      this.moveDirection.scaleInPlace(SPEED * GlobalManager.deltaTime);
      //this.mesh.position.addInPlace(this.moveDirection);
    }
    
      this.moveDirection.addInPlace(GlobalManager.gravityVector.scale(GlobalManager.deltaTime))
      this.mesh.moveWithCollisions(this.moveDirection)
      //permet d'appliquer la translation
      
      let collidedMesh = this.mesh.collider ? this.mesh.collider.collidedMesh : null;
      if(collidedMesh){
        console.log(collidedMesh)
      }
      //this.mesh.position.addInPlace(this.moveDirection);
    //permet de suivre le Player
    GlobalManager.camera.target = this.mesh.position;
  }

  createEllipsoidLines(a,b) {
    // Crée des points pour former une courbe
    // Supposons que votre modèle est chargé dans une variable "model"
    const points = [];
    for (let theta = -Math.PI / 2; theta < Math.PI / 2; theta += Math.PI / 36) {
      points.push(new Vector3(0, a * Math.sin(theta), b* Math.cos(theta)));
    }
    
    // Crée la première ligne
    const ellipse = [];
    ellipse[0] = MeshBuilder.CreateLines("ellipsoidLine", { points: points }, GlobalManager.scene);
    ellipse[0].color = new Color3(1, 0, 0);
    ellipse[0].parent = this.mesh;
    
    // Duplique et fait tourner pour former un ellipsoïde complet
    const steps = 24;
    const dTheta = 2 * Math.PI / steps;
    for (let i = 1; i < steps; i++) {
      ellipse[i] = ellipse[0].clone("ellipsoidLine" + i);
      ellipse[i].parent = this.mesh;
      ellipse[i].rotation.y = i * dTheta;
    }
  }


}export default Player;