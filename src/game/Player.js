import {Vector4,Vector3, AxesViewer, MeshBuilder, StandardMaterial, Color3,Color4,Matrix,TransformNode} from '@babylonjs/core';
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
  rotationSpeed = 5;
  tmpRotationSpeed;
  speed;
  gravity = 9.8;
  gravityDirection = new Vector3(0, 0, 0);
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
  isJumping = true;
  cameraTarget;
  lookDirectionQuaternion = new Quaternion.Identity();

  constructor() {}

  async init() {
  
    const result = await SceneLoader.ImportMeshAsync("", pathPlayerGLB, PlayerGLB, GlobalManager.scene);
    this.mesh = result.meshes[0];
    this.mesh.name = "player";
    //this.mesh = MeshBuilder.CreateBox("player", {size: 1}, GlobalManager.scene);
    this.mesh.position = new Vector3(100, 60, 60);
    this.mesh.ellipsoid = new Vector3(0.4, 0.5, 0.4);
    this.mesh.ellipsoidOffset = new Vector3(0.0, 0.0, 0.0);
    this.mesh.checkCollisions = false;
    
    if (!this.mesh.rotationQuaternion) {
      this.mesh.rotationQuaternion = Quaternion.Identity();
    }
    
    if (DEBUG_MODE) {
      this.createEllipsoidLines(this.mesh.ellipsoid.x - this.mesh.ellipsoidOffset.x , this.mesh.ellipsoid.y - this.mesh.ellipsoidOffset.y);
    }

    let camera = new ArcRotateCamera("playerCamera", -Math.PI / 2, 3 * Math.PI / 10, 10, this.mesh.position, GlobalManager.scene);
    camera.lowerBetaLimit = 0.01 // ou 0.01 si tu veux éviter qu'elle s'inverse complètement
    camera.upperBetaLimit = null;
    


    
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
    //console.log(result.meshes);
  }

  update(inputMap, actions,planet) {
    this.currentPlanet = planet;
    this.getInputs(inputMap, actions);
    this.applyCameraToInput(inputMap);
    this.move();
    this.applyGravity();
    this.applyPlanetRotation();
  
    this.getDistPlanetPlayer(this.currentPlanet);
  }

  
  
  getInputs(inputMap, actions) {
    this.moveInput.set(0, 0, 0);

    if (inputMap["KeyA"]) this.moveInput.x = -1;
    if (inputMap["KeyD"]) this.moveInput.x = 1;
    if (inputMap["KeyW"]) this.moveInput.z = 1;
    if (inputMap["KeyS"]) this.moveInput.z = -1;

    if (actions["Space"] && !this.isJumping ) {
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
      let right = getRightVector(GlobalManager.camera, true);
  
      forward.scaleInPlace(this.moveInput.z);
      right.scaleInPlace(this.moveInput.x);
  
      let moveDir = forward.add(right);
      let tangent = moveDir.subtract(this.normalVector.scale(Vector3.Dot(moveDir, this.normalVector)));
      
      //console.log("Tangent: ", tangent, "Normal: ", this.normalVector, "MoveDir: ", moveDir);
      if (tangent.length() > 0.001) {
        this.moveDirection = tangent.normalize();
  
        if (this.moveDirection.length() > 0.001 && this.normalVector.length() > 0.001) {
          //this.lookDirectionQuaternion = this.lookDirectionQuaternion.multiply(Quaternion.RotationAxis(this.moveDirection, Math.PI / 2));
          //Quaternion.FromLookDirectionLHToRef(this.moveDirection, this.normalVector, this.lookDirectionQuaternion);  
          // Calcul du vecteur tangent sur la planète
            let moveDir = forward.add(right);
            let tangent = moveDir.subtract(this.normalVector.scale(Vector3.Dot(moveDir, this.normalVector)));

            if (tangent.length() > 0.001) {
              this.moveDirection = tangent.normalize();

              // 💡 Tourne autour de la normale uniquement
              const up = this.normalVector.scale(-1); // Le haut du perso = vers l'opposé de la gravité
              const rotationMatrix = Matrix.RotationAxis(up, Math.atan2(-this.moveDirection.x, -this.moveDirection.z));

              this.lookDirectionQuaternion = Quaternion.FromRotationMatrix(rotationMatrix);
            }

        }
      }
    }
  }
  
  
  move() {
    if (!this.mesh) return;

    if (this.moveDirection.length() !== 0) {
      Quaternion.SlerpToRef(this.mesh.rotationQuaternion, this.lookDirectionQuaternion, SPEED_ROTATION * GlobalManager.deltaTime, this.mesh.rotationQuaternion);
      this.moveDirection.scaleInPlace(SPEED * GlobalManager.deltaTime);
    }
    this.moveDirection.addInPlace(this.gravityDirection);
    this.mesh.moveWithCollisions(this.moveDirection);
    this.gravityDirection.set(0, 0, 0);
    //console.log(this.moveDirection);
  }

  applyGravity() {
    if (!this.currentPlanet) return;
    
    const origin = this.mesh.position.clone();
    const rayLength = 1;

    if (!this.checkIfGrounded()) {
      this.gravityDirection = this.normalVector.normalize().scale(this.gravity * GlobalManager.deltaTime);
    } else {
      this.gravityDirection.set(0, 0, 0);
      this.isJumping = false; // reset pour les sauts
    }
    
   // Ray 1 : vers le bas (opposé à up)
    let direction = getUpVector(this.mesh).scale(-1);
    let hits = GlobalManager.scene.multiPickWithRay(new Ray(origin, direction, rayLength), (mesh) =>
      mesh !== this.mesh && mesh.isPickable && mesh.checkCollisions
    );
  
    // Ray 2 : vers l'avant
    if (!hits || hits.length === 0) {
      direction = getForwardVector(this.mesh);
      hits = GlobalManager.scene.multiPickWithRay(new Ray(origin, direction, rayLength), (mesh) =>
        mesh !== this.mesh && mesh.isPickable && mesh.checkCollisions
      );
    }
  
    // Ray 3 : vers l'arrière
    if (!hits || hits.length === 0) {
      direction = getForwardVector(this.mesh).scale(-1);
      hits = GlobalManager.scene.multiPickWithRay(new Ray(origin, direction, rayLength), (mesh) =>
        mesh !== this.mesh && mesh.isPickable && mesh.checkCollisions
      );
    }
  
    // Ray 4 : vers la droite
    if (!hits || hits.length === 0) {
      direction = getRightVector(this.mesh);
      hits = GlobalManager.scene.multiPickWithRay(new Ray(origin, direction, rayLength), (mesh) =>
        mesh !== this.mesh && mesh.isPickable && mesh.checkCollisions
      );
    }
  
    // Ray 5 : vers la gauche
    if (!hits || hits.length === 0) {
      direction = getRightVector(this.mesh).scale(-1);
      hits = GlobalManager.scene.multiPickWithRay(new Ray(origin, direction, rayLength), (mesh) =>
        mesh !== this.mesh && mesh.isPickable && mesh.checkCollisions
      );
    }
  
    // Ray 6 : direction vers la planète
    if (!hits || hits.length === 0) {
      this.planetDir = this.currentPlanet.position.subtract(this.mesh.position).normalize();
      hits = GlobalManager.scene.multiPickWithRay(new Ray(origin, this.planetDir, rayLength), (mesh) =>
        mesh !== this.mesh && mesh.isPickable && mesh.checkCollisions
      );
    }
  
    this.getPlanetNormal();
  
    //this.mesh.moveWithCollisions(this.gravityDirection);
  
    this.hits = [];
  }
  
  checkIfGrounded() {
    const origin = this.mesh.position.clone();
    const direction = this.normalVector.clone();
    const rayLength = 0.6;
  
    const ray = new Ray(origin, direction, rayLength);
    const pick = GlobalManager.scene.pickWithRay(ray, (mesh) =>
      mesh !== this.mesh && mesh.isPickable && mesh.checkCollisions
    );
  
    return pick && pick.hit;
  }
  

  getPlanetNormal() {
    if (!this.currentPlanet) return;
  
    this.normalVector = this.currentPlanet.position.subtract(this.mesh.position).normalize();

    for (let hit of this.hits) {
      if (hit.pickedMesh === this.currentPlanet) {
        const n = hit.getNormal(true);
        if (n) {
          this.normalVector = n.normalize();
          console.log("Normal Vector: ", this.normalVector);
          break;
        }
      }
    }
  }
  

  applyPlanetRotation() {
    if (!this.mesh || !this.normalVector) return;
  
    const currentUp = getUpVector(this.mesh); // On veut que le perso regarde à l'opposé de la gravité
    const desiredUp = this.normalVector.scale(-1); // On veut que le perso regarde à l'opposé de la gravité
  
    // Vérifie si déjà aligné
    const dot = Vector3.Dot(currentUp, desiredUp);
    if (dot > 0.9999) return;
  
    // Axe de rotation
    let axis = Vector3.Cross(currentUp, desiredUp);
  
    if (axis.length() < 0.001 || isNaN(axis.x)) {
      axis = Vector3.Cross(currentUp, new Vector3(1, 0, 0));
      if (axis.length() < 0.001) {
        axis = Vector3.Cross(currentUp, new Vector3(0, 0, 1));
      }
    }
    axis.normalize();
  
    // Angle de rotation
    const angle = Math.acos(Math.min(Math.max(dot, -1), 1)); // clamp entre -1 et 1
  
    // Quaternion de rotation
    const qRot = Quaternion.RotationAxis(axis, angle);
    const targetRotation = qRot.multiply(this.mesh.rotationQuaternion);
  
    if (this.isValidQuaternion(targetRotation)) {
      Quaternion.SlerpToRef(
        this.mesh.rotationQuaternion,
        targetRotation,
        this.rotationSpeed * GlobalManager.deltaTime,
        this.mesh.rotationQuaternion
      );
    } else {
      console.warn("Quaternion invalide");
    }
  }
  
  
  
  isValidQuaternion(quat) {
    return (
      !isNaN(quat.x) &&
      !isNaN(quat.y) &&
      !isNaN(quat.z) &&
      !isNaN(quat.w)
    );
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
  

}
export default Player;
