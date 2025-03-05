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
        this.ground = new BABYLON.MeshBuilder.CreateGround("ground", { width: 100, height: 100 }, this.scene);
        // Create a camera (e.g., an ArcRotateCamera)
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
