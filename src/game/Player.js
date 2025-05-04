import {Vector4, Vector3, AxesViewer, MeshBuilder, StandardMaterial, Color3, Color4, Matrix, TransformNode} from '@babylonjs/core';
import {SceneLoader} from '@babylonjs/core/Loading/sceneLoader';
import '@babylonjs/loaders';
import {getForwardVector, getRightVector, getUpVector} from "./getDirectionMesh.js";
import {drawRay, createEllipsoidLines} from "./debugDraw.js";
import {ArcRotateCamera, Quaternion, Ray} from "babylonjs";
import {DEBUG_MODE} from "./Game.js";
import {GlobalManager} from './GlobalManager.js';
import Game from './Game.js';

const SPEED = 5;
const SPEED_ROTATION = 5;
const JUMP_FORCE = 12;

const pathPlayerGLB = "/assets/";
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
  //
  gravity = -9.8;
  gravityVelocity = new Vector3(0, 0, 0);
  tmpGravity;
  jumpForce = JUMP_FORCE;
  currentPlanet;
  //rayCast
  hits = [];

  planetDir = new Vector3(0, 0, 0);
  normalVector = new Vector3(0, 0, 0);
  // Nouvelle propriété pour l'interpolation de la normale
  interpolatedNormal = new Vector3(0, 0, 0);

  //============================
  jumpVelocity = 0;
  isJumping = false;
  cameraTarget;
  lookDirectionQuaternion = new Quaternion.Identity();

  constructor() {}

  async init(planet) {
    const result = await SceneLoader.ImportMeshAsync("", pathPlayerGLB, PlayerGLB, GlobalManager.scene);
    this.mesh = result.meshes[0];
    this.mesh.name = "player";
    // this.mesh = MeshBuilder.CreateBox("player", {size: 1}, GlobalManager.scene);
    this.mesh.position = new Vector3(20, 45, 20);
    this.mesh.ellipsoid = new Vector3(0.5, 0.5, 0.5);
    this.mesh.ellipsoidOffset = new Vector3(0.0, 0.0, 0.0);
    
    //this.mesh.scaling = new Vector3(0.03, 0.03, -0.03);
  
    if (!this.mesh.rotationQuaternion) {
      this.mesh.rotationQuaternion = Quaternion.Identity();
    }
    
    if (DEBUG_MODE) {
      createEllipsoidLines(this.mesh, this.mesh.ellipsoid.x - this.mesh.ellipsoidOffset.x, this.mesh.ellipsoid.y - this.mesh.ellipsoidOffset.y);
    }

    let camera = new ArcRotateCamera("playerCamera", -Math.PI / 2, 3 * Math.PI / 10, 10, this.mesh.position, GlobalManager.scene);
    // Optionnel : adapter l'upVector de la caméra en fonction de la normale
    // camera.upVector = this.normalVector.clone();
    
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

  update(inputMap, actions, planet) {
    this.currentPlanet = planet;
    this.getInputs(inputMap, actions);
    this.applyCameraToInput(inputMap);
    this.move();
    this.applyGravity();
    this.applyPlanetRotation();
    this.adjustCameraUpVector();
    this.adjustToTerrain();
  }

  getInputs(inputMap, actions) {
    this.moveInput.set(0, 0, 0);

    if (inputMap["KeyA"]) this.moveInput.x = -1;
    if (inputMap["KeyD"]) this.moveInput.x = 1;
    if (inputMap["KeyW"]) this.moveInput.z = 1;
    if (inputMap["KeyS"]) this.moveInput.z = -1;

    // Si la touche espace est pressée et que le personnage n'est pas déjà en saut, déclenche le saut
    if (actions["Space"] && !this.isJumping) {
      this.jump();
      actions["Space"] = false;
    }
    
    if (inputMap["leftStickX"] !== undefined && Math.abs(inputMap["leftStickX"]) > 0.15) {
      this.moveInput.x = inputMap["leftStickX"] * GlobalManager.deltaTime;
    }
    if (inputMap["leftStickY"] !== undefined && Math.abs(inputMap["leftStickY"]) > 0.15) {
      this.moveInput.z = -inputMap["leftStickY"] * GlobalManager.deltaTime;
    }

    if (inputMap["rightStickX"] !== undefined && Math.abs(inputMap["rightStickX"]) > 0.15) {
      GlobalManager.camera.alpha -= inputMap["rightStickX"] * GlobalManager.deltaTime;
    }
    if (inputMap["rightStickY"] !== undefined && Math.abs(inputMap["rightStickY"]) > 0.15) {
      GlobalManager.camera.beta -= inputMap["rightStickY"] * GlobalManager.deltaTime;
    }
    
    //marche pas
  
    if (actions["buttonX"] && !this.isJumping) {
      console.log("Jump triggered by gamepad button X");
      this.jump();
      actions["buttonX"] = false;
    }
  }
  
  // Méthode dédiée pour déclencher le saut
  jump() {
    // Applique une impulsion dans la direction opposée à la normale (donc vers le haut)
    this.gravityVelocity = this.normalVector.scale(this.jumpForce);
    this.isJumping = true;
  }

  applyCameraToInput() {
    this.moveDirection.set(0, 0, 0);
  
    if (this.moveInput.length() !== 0) {
      let forward = getForwardVector(GlobalManager.camera, true).normalize();
      let right = getRightVector(GlobalManager.camera, true).normalize();
  
      forward.scaleInPlace(this.moveInput.z);
      right.scaleInPlace(this.moveInput.x);

      // Somme pour obtenir la direction brute
      let rawDirection = forward.add(right);
  
      // Projection sur le plan tangent à la surface (enlever la composante selon la normale)
      const dot = Vector3.Dot(rawDirection, this.normalVector);
      const projectedDirection = rawDirection.subtract(this.normalVector.scale(dot)).normalize();
  
      this.moveDirection = projectedDirection;  
      Quaternion.FromLookDirectionLHToRef(this.moveDirection, this.normalVector, this.lookDirectionQuaternion);
    }
  }

  move() {
    if (!this.mesh) return;

    const finalMove = new Vector3(0, 0, 0);

    const gravityMove = this.gravityVelocity.scale(GlobalManager.deltaTime);
    finalMove.addInPlace(gravityMove);
    
    if (this.moveDirection.length() !== 0) {
      Quaternion.SlerpToRef(this.mesh.rotationQuaternion, this.lookDirectionQuaternion, SPEED_ROTATION * GlobalManager.deltaTime, this.mesh.rotationQuaternion);
      this.moveDirection.scaleInPlace(SPEED * GlobalManager.deltaTime);
      finalMove.addInPlace(this.moveDirection);
    }
    
    this.mesh.moveWithCollisions(finalMove);
  }

  applyGravity() {
    // Si nécessaire, vérifier qu'une planète est définie (si plusieurs planètes)
    // if (!this.currentPlanet) return;
    let rayChoiced;
    const origin = this.mesh.position;
    //console.log(this.currentPlanet.mesh.name);
    if(this.currentPlanet.mesh.name === "planet") {
      rayChoiced = this.currentPlanet.radius;
    }
    else {
      rayChoiced = 10;
    }

    const rayLength = rayChoiced
    //console.log(rayChoiced);
    // Ray 1 : vers le bas (opposé à up)
    let direction = getUpVector(this.mesh).scale(-1);
    if(DEBUG_MODE) {
      drawRay(origin, direction, rayLength, new Color3(1, 0, 0)); // rouge
    }
    this.hits = GlobalManager.scene.multiPickWithRay(new Ray(origin, direction, rayLength), (mesh) =>
      mesh !== this.mesh && mesh.isPickable && mesh.checkCollisions && this.mesh.ellipsoid
    );
    
    // Ray 2 : vers l'avant
    if (this.hits.length === 0) {
      direction = getForwardVector(this.mesh);
      if(DEBUG_MODE){
        drawRay(origin, direction, rayLength, new Color3(1, 0, 0));
      }
      this.hits = GlobalManager.scene.multiPickWithRay(new Ray(origin, direction, rayLength), (mesh) =>
        mesh !== this.mesh && mesh.isPickable && mesh.checkCollisions && this.mesh.ellipsoid
      );
    }
  
    // Ray 3 : vers l'arrière
    if (this.hits.length === 0) {
      direction = getForwardVector(this.mesh).scale(-1);
      if(DEBUG_MODE) {
        drawRay(origin, direction, rayLength, new Color3(1, 0, 0));
      }
      this.hits = GlobalManager.scene.multiPickWithRay(new Ray(origin, direction, rayLength), (mesh) =>
        mesh !== this.mesh && mesh.isPickable && mesh.checkCollisions && this.mesh.ellipsoid
      );
    }
  
    // Ray 4 : vers la droite
    if (this.hits.length === 0) {
      direction = getRightVector(this.mesh);
      if(DEBUG_MODE) {
        drawRay(origin, direction, rayLength, new Color3(1, 0, 0));
      }
      this.hits = GlobalManager.scene.multiPickWithRay(new Ray(origin, direction, rayLength), (mesh) =>
        mesh !== this.mesh && mesh.isPickable && mesh.checkCollisions && this.mesh.ellipsoid
      );
    }
  
    // Ray 5 : vers la gauche
    if (this.hits.length === 0) {
      direction = getRightVector(this.mesh).scale(-1);
      if(DEBUG_MODE) {
        drawRay(origin, direction, rayLength, new Color3(1, 0, 0));
      }
      this.hits = GlobalManager.scene.multiPickWithRay(new Ray(origin, direction, rayLength), (mesh) =>
        mesh !== this.mesh && mesh.isPickable && mesh.checkCollisions && this.mesh.ellipsoid
      );
    }
    
  
      // Ray 6 : direction vers la planète, si le joueur n'est pas déjà dans le champ de gravité
      if (this.hits.length === 0) {
        this.planetDir = this.currentPlanet.position.subtract(this.mesh.position).normalize();
        if(DEBUG_MODE) {
          drawRay(origin, this.planetDir, rayLength, new Color3(1, 0, 0));
        }
        this.hits = GlobalManager.scene.multiPickWithRay(new Ray(origin, this.planetDir, rayLength), (mesh) =>
        mesh !== this.mesh && mesh.isPickable && mesh.checkCollisions && this.mesh.ellipsoid
        );
      }
    
    //}
    
    // Recalcule la normale de la planète
    this.getPlanetNormal();
    
    // INTERPOLATION : on met à jour une normale interpolée pour décaler l'application de la gravité
    const interpolationFactor = 0.15; // Facteur d'interpolation 
    this.interpolatedNormal = Vector3.Lerp(this.interpolatedNormal, this.normalVector, interpolationFactor);
    
    // Appliquer la gravité en utilisant la normale interpolée
    const gravityAccel = this.interpolatedNormal.scale(this.gravity * GlobalManager.deltaTime);
    this.gravityVelocity.addInPlace(gravityAccel);
    
    // Raycast pour détecter le sol (vers la planète)
    const rayToPlanet = new Ray(origin, this.normalVector.negate(), 0.55);
    const hit = GlobalManager.scene.pickWithRay(rayToPlanet, (mesh) =>
      mesh !== this.mesh && mesh.isPickable && mesh.checkCollisions && this.mesh.ellipsoid
    );
  
    if (hit && hit.hit) {
      // Si on touche le sol : réinitialise la vélocité gravitationnelle et réautorise le saut
      this.gravityVelocity.set(0, 0, 0);
      this.isJumping = false;
    }
    
    this.hits = [];
  }

  getPlanetNormal() {
    if (!this.currentPlanet) return;
  
    // Normal par défaut : du joueur vers la planète
    this.normalVector = this.currentPlanet.position.subtract(this.mesh.position).normalize();
    
    for (let hit of this.hits) {
      let planetName = this.currentPlanet.mesh.name;
      //console.log("planetName : "+planetName); 
      let pickedMeshName = hit.pickedMesh.name;
      //console.log("pickedMeshName : "+pickedMeshName); 
      if (pickedMeshName === planetName) {
        const n = hit.getNormal(true, true).normalize();
        if (n) {
          const normalizedNormal = n.normalize();
          // Dessine le vecteur normal depuis le point d'impact (s'il est défini)
          if (hit.pickedPoint) {
            if(DEBUG_MODE) {
              drawRay(hit.pickedPoint, normalizedNormal, 2, new Color3(1, 1, 0));
            }
            this.normalVector = normalizedNormal;
          }
          break;
        }
      }
    }
    return;
  }
  
  applyPlanetRotation() {
    const currentUp = getUpVector(this.mesh, true).normalize();
    
    const axis = Vector3.Cross(currentUp, this.normalVector).normalize();
    
    const angle = Vector3.GetAngleBetweenVectors(currentUp, this.normalVector, axis);
    
    if (DEBUG_MODE){      
      //drawRay(this.mesh.position, this.normalVector, 1, new Color3(0, 1, 1)); // cyan
      //drawRay(this.mesh.position, axis, 1, new Color3(0, 0, 1)); // bleu
      //drawRay(this.mesh.position, currentUp, 1, new Color3(0, 1, 0)); // vert
    }
    
    
    const qRot = Quaternion.RotationAxis(axis, angle);
    const targetRotation = qRot.multiply(this.mesh.rotationQuaternion);
  
    Quaternion.SlerpToRef(
      this.mesh.rotationQuaternion,
      targetRotation,
      this.rotationSpeed * GlobalManager.deltaTime,
      this.mesh.rotationQuaternion
    );
  }
  
  adjustCameraUpVector() {
    if (!this.normalVector || !GlobalManager.camera || this.isJumping) return;
  
    const currentUp = GlobalManager.camera.upVector;
    const targetUp = this.normalVector;
    GlobalManager.camera.upVector = Vector3.Lerp(currentUp, targetUp, GlobalManager.deltaTime * this.rotationSpeed);
    
  }
  
  getDistPlanetPlayer(planet) {
    let direction = this.mesh.position.subtract(planet.position);
    if (DEBUG_MODE) {
      //drawRay(this.mesh.position, planet.position, direction);
    }
    return this.mesh.position.subtract(planet.position);
  }
  
  // Méthode pour vérifier si le joueur est dans le champ de gravité de la planète
  isInGravityField() {
    if (!this.currentPlanet) return false;
    const distVec = this.getDistPlanetPlayer(this.currentPlanet);
    const distance = distVec.length();
    const gravityFieldRadius = this.currentPlanet.gravityFieldRadius || 50;
    return distance <= gravityFieldRadius;
  }

  /**
 * Ajuste la position du joueur pour qu'il suive les petites irrégularités de la planète.
 */
  adjustToTerrain() {
    // 1) On part d'un point un peu au-dessus du joueur
    const above = this.mesh.position.add(this.normalVector.scale(1));  // 2 unités au-dessus

    // 2) On tire un rayon vers la planète (le long de la normale inversée)
    const ray = new Ray(above, this.normalVector.negate(), 2); 
    if (DEBUG_MODE) {
      drawRay(above, this.normalVector.negate(), 2, new Color3(0, 1, 0)); // vert
    }
    // 3) On picke la planète seulement
    const hit = GlobalManager.scene.multiPickWithRay(ray, (mesh) => 
      mesh !== this.mesh &&  mesh.checkCollisions && this.mesh.ellipsoid 
  );
  setTimeout(() => {
  //console.log("hit : ", hit),
  500
  });
  // 4) Si on touche bien la surface, on replace le joueur
  if (hit && hit.hit && hit.pickedPoint) {
    // Offset pour que l'ellipsoïde ne passe pas à travers le sol
    const surfaceOffset = this.mesh.ellipsoidOffset.y * this.mesh.scaling.y;
    this.mesh.position = hit.pickedPoint.add(this.normalVector.scale(surfaceOffset));
  }
}


}

export default Player;
