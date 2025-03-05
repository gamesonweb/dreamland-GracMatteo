import * as BABYLON from '@babylonjs/core/Legacy/legacy';
import '@babylonjs/loaders/glTF';
//import PlayerInput from './PlayerInput.js';

export default class Player {
    constructor(scene, camera, inputs) {
      this.scene = scene;
      this.camera = camera;
      this.inputs = inputs;
      
      // Création du mesh du joueur (ici une sphère)
      //this.mesh = BABYLON.MeshBuilder.CreateSphere("player", { diameter: 2 }, scene);
      BABYLON.SceneLoader.ImportMeshAsync("", "./src/game/assets/", "angryAntoine.glb", this.scene)
    .then((result) => {
        this.mesh = result.meshes[0];
        this.mesh.scaling = new BABYLON.Vector3(1,1,1);
        this.mesh.position = new BABYLON.Vector3(0, 1, 0);
        this.mesh.rotationQuaternion = new BABYLON.Quaternion(0, 0, 0, 1);
    })
    .catch((error) => {
        console.error("Erreur lors de l'importation du mesh :", error);
    });

      
    
      // Position initiale (y = 1 pour toucher le sol)
      //this.mesh.position.y = 1;
      //this.mesh.rotationQuaternion = new BABYLON.Quaternion(0, 0, 0, 1);
      
      // Variables pour le saut
      this.jumpVelocity = 0;
      this.gravity = -0.03;
    }
    
    update() {
        if (!this.mesh) return;
        const step = 0.15;
      // Calcul du vecteur forward à partir de la caméra
      let forward = this.camera.target.subtract(this.camera.position);
      forward.y = 0;
      forward = BABYLON.Vector3.Normalize(forward);
      
      // Vecteur pour accumuler les directions de déplacement
      let moveDirection = BABYLON.Vector3.Zero();
      if (this.inputs.isKeyPressed("z")) {
        moveDirection = moveDirection.add(forward);
        console.log("z" + moveDirection);
      }
      if (this.inputs.isKeyPressed("s")) {
        moveDirection = moveDirection.add(forward.scale(-1));
        console.log("s" + moveDirection);
      }
      if (this.inputs.isKeyPressed("q")) {
        let left = BABYLON.Vector3.Cross(forward, new BABYLON.Vector3(0, 1, 0));
        left = BABYLON.Vector3.Normalize(left);
        moveDirection = moveDirection.add(left);
        console.log("q" + moveDirection);
      }
      if (this.inputs.isKeyPressed("d")) {
        let right = BABYLON.Vector3.Cross(new BABYLON.Vector3(0, 1, 0), forward);
        right = BABYLON.Vector3.Normalize(right);
        moveDirection = moveDirection.add(right);
        console.log("d" + moveDirection);
      }
      
      // Appliquer le déplacement horizontal si une direction est indiquée
      if (moveDirection.length() > 0) {
        moveDirection = BABYLON.Vector3.Normalize(moveDirection);
        this.mesh.position.addInPlace(moveDirection.scale(step));
        const yaw = Math.atan2(moveDirection.x, moveDirection.z);
        this.mesh.rotationQuaternion = BABYLON.Quaternion.FromEulerAngles(0, yaw, 0);
      }
      
      // Gestion du saut : si la touche espace est pressée et que le joueur est au sol
      if ((this.inputs.isKeyPressed(" ") || this.inputs.isKeyPressed("Space")) && this.mesh.position.y === 1) {
        this.jumpVelocity = 0.5;
      }
      
      // Appliquer la vélocité verticale et la gravité
      this.mesh.position.y += this.jumpVelocity;
      this.jumpVelocity += this.gravity;
      // Si le joueur est en dessous du sol, le remettre au niveau du sol et réinitialiser la vélocité
      if (this.mesh.position.y < 1) {
        this.mesh.position.y = 1;
        this.jumpVelocity = 0;
      }
      //console.log(this.mesh.position);
      console.log(moveDirection)
      this.camera.setTarget(this.mesh.position);
    }
}