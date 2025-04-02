import {Vector4,Vector3, AxesViewer, MeshBuilder, StandardMaterial, Color3,Color4} from '@babylonjs/core';
import {SceneLoader} from '@babylonjs/core/Loading/sceneLoader';
import '@babylonjs/loaders';
import {getForwardVector, getRightVector, getUpVector} from "./getDirectionMesh.js";
import {ArcRotateCamera, Quaternion, Ray} from "babylonjs";
import {DEBUG_MODE} from "./Game.js";
import {GlobalManager} from './GlobalManager.js';
import Game from './Game.js';

const SPEED = 5;
const SPEED_ROTATION = 5;


const pathPlayerGLB = "./src/game/assets/";
const PlayerGLB = "angryAntoine.glb"; 

class Player {
  mesh;
  scene;
  camera;
  axies;

  moveInput = new Vector3(0, 0, 0);
  moveDirection = new Vector3(0, 0, 0);
  //============================
  rayCastLenght;
  rotationSpeed;
  tmpRotationSpeed;
  speed;
  gravity = -9.81;
  tmpGravity;
  jumpForce = 20;
  currentPlanet;
  distLinePlanetToPlayer;
  //rayCast
  hits = [];

  planetDir = new Vector3(0, 0, 0);
  normalVector = new Vector3(0, 0, 0);
  //============================
  jumpVelocity = 0;
  
  
  
  isJumping = false;

  lookDirectionQuaternion = new Quaternion.Identity();

  constructor() {}

  async init() {
  
    const result = await SceneLoader.ImportMeshAsync("", pathPlayerGLB, PlayerGLB, GlobalManager.scene);
    this.mesh = result.meshes[0];
    this.mesh.position = new Vector3(1, 0.6, 1);
    this.mesh.ellipsoid = new Vector3(0.4, 0.5, 0.4);
    this.mesh.ellipsoidOffset = new Vector3(0.0, 0.0, 0.0);
    this.mesh.checkCollisions = true;
    this.mesh.rotationQuaternion = Quaternion.Identity();

    
    if (DEBUG_MODE) {
      this.createEllipsoidLines(this.mesh.ellipsoid.x - this.mesh.ellipsoidOffset.x , this.mesh.ellipsoid.y - this.mesh.ellipsoidOffset.y);
    }

    let camera = new ArcRotateCamera("playerCamera", -Math.PI / 2, 3 * Math.PI / 10, 10, this.mesh.position, GlobalManager.scene);
    GlobalManager.camera = camera;
    GlobalManager.addShadowCaster(this.mesh, true);
    GlobalManager.camera.attachControl(GlobalManager.engine.getRenderingCanvas(), true);

    this.applyCameraToInput();

    this.tmpGravity = this.gravity;
    this.tmpRotationSpeed = this.rotationSpeed;
    if (DEBUG_MODE) {
      this.axies = new AxesViewer(GlobalManager.scene, 1);
      this.axies.xAxis.parent = this.mesh;
      this.axies.yAxis.parent = this.mesh;
      this.axies.zAxis.parent = this.mesh;
    }
    
  }

  update(inputMap, actions,planet) {
    this.currentPlanet = planet;
    this.getInputs(inputMap, actions);
    this.applyCameraToInput(inputMap);
    this.move();
    
    //console.log(this.getDistPlanetPlayer(planet))
  }

  //temporaire
  checkIfGrounded() {
    const ray = new Ray(this.mesh.position, new Vector3(0, -1, 0), 0.6);
    const pick = GlobalManager.scene.pickWithRay(ray, (mesh) => mesh.isPickable && mesh !== this.mesh && mesh.checkCollisions && mesh.ellipsoid !== undefined);
    return pick && pick.hit;
  }

  getInputs(inputMap, actions) {
    this.moveInput.set(0, 0, 0);

    if (inputMap["KeyA"]) this.moveInput.x = -1;
    if (inputMap["KeyD"]) this.moveInput.x = 1;
    if (inputMap["KeyW"]) this.moveInput.z = 1;
    if (inputMap["KeyS"]) this.moveInput.z = -1;

    if (actions["Space"] && !this.isJumping && this.checkIfGrounded()) {
      //console.log("jump");
      this.jumpVelocity = this.jumpForce;
      this.isJumping = true;
      actions["Space"] = false;
    }

    if (inputMap["leftStickX"] !== undefined && Math.abs(inputMap["leftStickX"]) > 0.15) {
      this.moveInput.x = inputMap["leftStickX"];
    }
    if (inputMap["leftStickY"] !== undefined && Math.abs(inputMap["leftStickY"]) > 0.15) {
      this.moveInput.z = -inputMap["leftStickY"];
    }

    if (inputMap["rightStickX"] !== undefined && Math.abs(inputMap["rightStickX"]) > 0.15) {
      GlobalManager.camera.alpha -= inputMap["rightStickX"] * GlobalManager.deltaTime;
    }
    if (inputMap["rightStickY"] !== undefined && Math.abs(inputMap["rightStickY"]) > 0.15) {
      GlobalManager.camera.beta -= inputMap["rightStickY"] * GlobalManager.deltaTime;
    }
  }

  applyCameraToInput() {
    this.moveDirection.set(0, 0, 0);

    if (this.moveInput.length() !== 0) {
      let forward = getForwardVector(GlobalManager.camera, true);
      forward.y = 0;
      forward.normalize();
      forward.scaleInPlace(this.moveInput.z);

      let right = getRightVector(GlobalManager.camera, true);
      right.y = 0;
      right.normalize();
      right.scaleInPlace(this.moveInput.x);
      
      let up = getUpVector(GlobalManager.camera,true)
      up.normalize()
      //console.log(up);
      console.log(this.getDistPlanetPlayer(this.currentPlanet));
      this.moveDirection = right.add(forward);
      this.moveDirection.normalize();

      Quaternion.FromLookDirectionLHToRef(this.moveDirection, Vector3.UpReadOnly, this.lookDirectionQuaternion);
    }
    
  }

  move() {
    if (!this.mesh) return;

    if (this.moveDirection.length() !== 0) {
      Quaternion.SlerpToRef(this.mesh.rotationQuaternion, this.lookDirectionQuaternion, SPEED_ROTATION * GlobalManager.deltaTime, this.mesh.rotationQuaternion);
      this.moveDirection.scaleInPlace(SPEED * GlobalManager.deltaTime);
    }

    this.jumpVelocity += this.gravity * GlobalManager.deltaTime;
    this.moveDirection.y = this.jumpVelocity * GlobalManager.deltaTime;
    
    if (this.checkIfGrounded()) {
      this.isJumping = false;
      this.jumpVelocity = 0;
    }

    this.mesh.moveWithCollisions(this.moveDirection);

    
    //console.log(this.getMinCoordinate());
    GlobalManager.camera.target = this.mesh.position;
  }

  createEllipsoidLines(a,b) {
    const points = [];
    for (let theta = -Math.PI / 2; theta < Math.PI / 2; theta += Math.PI / 36) {
      points.push(new Vector3(0, a * Math.sin(theta), b * Math.cos(theta)));
    }

    const ellipse = [];
    ellipse[0] = MeshBuilder.CreateLines("ellipsoidLine", {points: points}, GlobalManager.scene);
    ellipse[0].color = new Color3(1, 0, 0);
    ellipse[0].parent = this.mesh;

    const steps = 24;
    const dTheta = 2 * Math.PI / steps;
    for (let i = 1; i < steps; i++) {
      ellipse[i] = ellipse[0].clone("ellipsoidLine" + i);
      ellipse[i].parent = this.mesh;
      ellipse[i].rotation.y = i * dTheta;
    }
  }
  //get MinCoordinate of the mesh
  getMinCoordinate() {
    const boundingBox = this.mesh.getBoundingInfo().boundingBox;
    const min = boundingBox.minimumWorld;
    return new Vector3(min.x, min.y, min.z);
  }

  getDistPlanetPlayer(planet) {
    
    if (DEBUG_MODE) {
      const points = [this.mesh.position, planet.position];
      this.distLinePlanetToPlayer = MeshBuilder.CreateLines("planetToPlayer", {
        points: points,
        instance: this.distLinePlanetToPlayer,
        updatable: true,
        colors: [new Color4(1, 0, 0, 1), new Color4(1, 0, 0, 1)]
      }, GlobalManager.scene);
    }
    return this.mesh.position.subtract(planet.position);
  }
  
  getPlayerPositionOnPLanet(planet){
    
  }

}
export default Player;
