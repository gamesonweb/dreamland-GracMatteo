import { Engine, Scene } from '@babylonjs/core';
import  Player  from './Player.js';
import  PlayerInput  from './PlayerInput.js';

export default class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.engine = new Engine(this.canvas, true);
        this.scene = new Scene(this.engine);
        
    }

    async init() {
        this._createScene();
        this.playerInput = new PlayerInput();
        this.player = new Player(this.scene, this.camera, this.playerInput);
        
    }

    start() {
        this.scene.onBeforeRenderObservable.add(() => {
            this.player.update();
        });
        
        this.engine.runRenderLoop(() => {
            this.scene.render();
        });

        window.addEventListener('resize', () => {
            this.engine.resize();
        });
    }
    
    _createScene() {
        // Create your scene instance if not already created
        // Create a basic light, aiming 0,1,0 - meaning, to the sky
        this.light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), this.scene);
        //this.ground = new BABYLON.MeshBuilder.CreateGround("ground", { width: 100, height: 100 }, this.scene);
        
        
        // Création d'un ground de 50x50 unités
        //this.ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 50, height: 50 }, this.scene);
        this.ground = BABYLON.MeshBuilder.CreateGroundFromHeightMap("ground", "./src/game/assets/heightMap/heightMap.png", {
            width: 1000,
            height: 1000,
            subdivisions: 100,
            minHeight: -100,
            maxHeight: 100

        }, this.scene);

        const groundMaterial = new BABYLON.StandardMaterial("ground");
        groundMaterial.diffuseTexture = new BABYLON.Texture("./src/game/assets/heightMap/RuggedTerrain.jpg", this.scene);
        this.ground.material = groundMaterial;
        // Inclinaison du ground : par exemple, 15 degrés sur l'axe X
        //this.ground.rotation.x = BABYLON.Tools.ToRadians(15);


        // Create a camera (e.g., an ArcRotateCamera)
        // Create the box without the collision property in the options
        var box = BABYLON.MeshBuilder.CreateBox("box", {
            width: 5,
            height: 20,
            depth: 5,
        }, this.scene);

        // Enable collision detection on the created mesh
        box.checkCollisions = true;
        box.position = new BABYLON.Vector3(10,-30, 10);
        
        
        var box2 = BABYLON.MeshBuilder.CreateBox("box", {
            width: 2,
            height: 2,
            depth: 2,
        }, this.scene);
        box2.checkCollisions = true;
        box2.position = new BABYLON.Vector3(0, 0, 4);
        
        // Create a camera
        this.camera = new BABYLON.ArcRotateCamera(
          "camera",
          Math.PI / 2,
          Math.PI / 4,
          10,
          new BABYLON.Vector3(0, 0, 0),
          this.scene
        );
        this.camera.attachControl(this.canvas, true);
    }
    
    stop() {
        this.engine.stopRenderLoop();
    }
}
