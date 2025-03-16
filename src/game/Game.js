import {AxesViewer,KeyboardEventTypes, Scene ,Color4,MeshBuilder,Vector3,FreeCamera, StandardMaterial,HemisphericLight, Color3} from '@babylonjs/core';
import {GridMaterial} from "@babylonjs/materials";
import {Inspector} from "@babylonjs/inspector";


import Player from './Player.js';


var DEBUG_MODE = true;

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
        this.initKeyboard();
        this.player = new Player(this.scene);   
        //this.player.init();
        this.engine.hideLoadingUI();
    }

    async start() {
        
        await this.init();
        
        if(DEBUG_MODE){
            Inspector.Show(this.scene,{});
        }

        this.startTimer = 0;
        this.engine.runRenderLoop(() => {

             let DELTA_TIME = this.engine.getDeltaTime() / 1000.0
             //console.log("delta time : "+DELTA_TIME )
             this.update(DELTA_TIME);
            
             
             this.actions = {};
             this.scene.render(); 
            
        })
    }
    
    update(delta){
        //console.log("inputMap in Update of Game :"+this.inputMap)
        
        //rajouter les updates de toutes les entités
        this.player.update(delta,this.inputMap,this.actions);
        this.startTimer += delta;
    }

    async createScene() {
        
        this.scene = new Scene(this.engine);
        this.scene.clearColor = new Color4(0,0,0,0);
        this.scene.collisionsEnabled = true;
        

        //faire un cameraManager
        
        //this.camera = new FreeCamera("camera", new Vector3(0, 5, -10), this.scene);
        //this.camera.attachControl(this.canvas, true);
        
        this.light = new HemisphericLight("light", new Vector3(0, 0.8, 0), this.scene);
        
        
        var ground = MeshBuilder.CreateGround("ground", {width: 6, height: 6});
        var groundMaterial = new StandardMaterial("groundMaterial");
        groundMaterial.diffuseColor = new Color3( 0, 0, 1);
        ground.material = groundMaterial
        if (DEBUG_MODE){
            
            this.axesWorld = new AxesViewer(this.scene, 4);
            //ground grid pour debug
            var groundMaterial = new GridMaterial("groundMaterial");
            groundMaterial.diffuseColor = new Color3(0, 0, 1);
            ground.material = groundMaterial;    
        }
        
    }

    //a mettre dans un autre fichier
    initKeyboard(){
        this.scene.onKeyboardObservable.add((kbInfo) => {
            switch (kbInfo.type) {
                case KeyboardEventTypes.KEYDOWN :
                    this.inputMap[kbInfo.event.code] = true;
                    //console.log("keyDOWN"+this.inputMap);
                    break;
                case KeyboardEventTypes.KEYUP :
                    this.inputMap[kbInfo.event.code] = false;
                    this.actions[kbInfo.event.code] = true;
                    //console.log("keyUP"+kbInfo.event.code);
                    break;
            }
        })
    }



}
export {DEBUG_MODE}
