import * as BABYLON from "@babylonjs/core/Legacy/legacy";
import "@babylonjs/loaders/glTF";
import MovementRelative from "./MovementRelative";



export default class Player {
  constructor(scene, camera, inputs) {
    this.scene = scene;
    this.camera = camera;
    this.inputs = inputs;
    this.mesh = null;
    this.movementPlayer = null;
    this.hitbox = null; 
    this.shadowGenerator = null;
    var pathPlayer = "./src/game/assets/";
    BABYLON.SceneLoader.ImportMeshAsync("", pathPlayer, "angryAntoine.glb", this.scene)
      .then((result) => {
        this.mesh = result.meshes[0];
        this.mesh.scaling = new BABYLON.Vector3(1, 1, 1);
        // Rotation initiale si besoin
        this.mesh.rotationQuaternion = new BABYLON.Quaternion(0, 0, 0, 1);

        

        // -- (2) Récupérer le bas du bounding box (minimum.y) --
        const boundingBox = this.mesh.getBoundingInfo().boundingBox;
        const minY = boundingBox.minimum.y;

        // -- (3) Déplacer le pivot pour qu’il soit au niveau des pieds --
        //  Autrement dit, on décale le pivot de minY (qui est négatif ou positif selon le modèle).
        this.mesh.setPivotPoint(new BABYLON.Vector3(0, minY, 0));

        // -- (4) Placer le mesh pour que les pieds soient sur le sol --
        //  Si le sol est à y=0, vous pouvez mettre :
        this.mesh.position.y = 10;

        // Vous pouvez ajuster si votre sol est à une autre altitude
        // this.mesh.position.y = 1; // par exemple, si vous voulez qu’il soit à y=1

        // -- (5) Créer la hitbox (optionnel, selon vos besoins) --
        const constantWidth = 0.5;
        const constantHeight = 0.8;
        const constantDepth = 0.4;
        const center = boundingBox.center; // souvent (0,0,0) après le pivot, mais à vérifier

        this.hitbox = BABYLON.MeshBuilder.CreateBox("hitbox", {
          width: constantWidth,
          height: constantHeight,
          depth: constantDepth
        }, this.scene);
        this.hitbox.position = center.clone();
        this.hitbox.parent = this.mesh;
        this.hitbox.isVisible = true;

        // Matériau wireframe pour afficher uniquement les arêtes
        const hitboxMaterial = new BABYLON.StandardMaterial("hitboxMat", this.scene);
        hitboxMaterial.wireframe = true;
        this.hitbox.material = hitboxMaterial;

        // -- (6) Instancier MovementRelative en lui passant la hitbox si nécessaire --
        this.movementPlayer = new MovementRelative(
          this.mesh,
          this.camera,
          this.hitbox,
          this.inputs
        );
        //this.shadowGenerator = new BABYLON.ShadowGenerator(1024, this.camera);
        //this.shadowGenerator.addShadowCaster(this.mesh);
      })
      .catch((error) => {
        console.error("Erreur lors de l'importation du mesh :", error);
      });
  }
  
  update() {
    if (this.movementPlayer) {
      this.movementPlayer.calculMovemente();
    }
  }
}
