import {GridMaterial,AxesViewer,KeyboardEventTypes, Scene ,Color4,MeshBuilder,Vector3,FreeCamera, StandardMaterial,HemisphericLight, Color3} from '@babylonjs/core';
import Player from './Player.js';
//import { MeshBuilder } from 'babylonjs';

export default class Game {
    
    engine;
    canvas;
    scene;
    
    camera;
    light;
    axesWorld;

    startTimer;
    
    player;
    
    inputMap = {};
    actions = {}

    constructor(engine,canvas) {
        this.engine = engine;
        this.canvas = canvas;
        
    }

    async init() {
        this.engine.displayLoadingUI();
        await this.createScene();
        this.player = new Player(this.camera,this.scene);   
        this.initKeyboard();
        this.engine.hideLoadingUI();
    }

    async start() {
        
        await this.init();
        
        this.startTimer = 0;
        this.engine.runRenderLoop(() => {

             let DELTA_TIME = this.engine.getDeltaTime() / 1000.0
             
             this.update(DELTA_TIME);
            
             

             this.actions = {};
             this.scene.render(); 
            
        })
    }
    
    update(delta){

        //rajouter les updates de toutes les entités
        this.player.update(delta);
        this.startTimer += delta;
    }

    async createScene() {
        
        this.scene = new Scene(this.engine);
        this.scene.clearColor = new Color4(0,0,0,0);
        this.scene.collisionsEnabled = true;
        
        this.camera = new FreeCamera("camera", new Vector3(0, 5, -10), this.scene);
        this.camera.attachControl(this.canvas, true);
        
        this.light = new HemisphericLight("light", new Vector3(0, 1, 0), this.scene);
        
        //ground grid pour debug
        var ground = MeshBuilder.CreateGround("ground", {width: 6, height: 6});
        var groundMaterial = new GridMaterial("groundMaterial", this.scene);
        groundMaterial.diffuseColor = new Color3(0, 0, 1);
        ground.material = groundMaterial;

        this.axesWorld = new AxesViewer(this.scene, 4);
    }

    //a mettre dans un autre fichier
    initKeyboard(){
        this.scene.onKeyboardObservable.add((kbInfo) => {
            switch (kbInfo.type) {
                case KeyboardEventTypes.KEYDOWN :
                    this.inputMap[kbInfo.event.code] = true;
                    //console.log("keyDOWN"+kbInfo.event.code);
                case KeyboardEventTypes.KEYUP :
                    this.inputMap[kbInfo.event.code] = false;
                    this.actions[kbInfo.event.code] = true;
                    //console.log("keyUP"+kbInfo.event.code);
                    break;
            }
        })
    }



}
