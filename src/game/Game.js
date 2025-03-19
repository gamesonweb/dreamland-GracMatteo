import {AxesViewer,KeyboardEventTypes, Scene ,Color4,MeshBuilder,Vector3,FreeCamera, StandardMaterial,HemisphericLight, Color3,ShadowGenerator, ReflectiveShadowMap, DirectionalLight, GamepadManager, Gamepad} from '@babylonjs/core';
import {GridMaterial} from "@babylonjs/materials";
import {Inspector} from "@babylonjs/inspector";

import Ammo from 'ammo.js'; 

import Player from './Player.js';
import { GlobalManager } from './GlobalManager.js';


var DEBUG_MODE = false;

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

    sunLight;
    sunAngle = 0;

    gamepadManager;
    gamepad;

    constructor(engine,canvas) {
        GlobalManager.engine = engine;
        GlobalManager.canvas = canvas;
    }

    async init() {
        GlobalManager.engine.displayLoadingUI();
        
        
        
        await this.createScene();
        this.initKeyboard();
        this.initGamepad();
        this.player = new Player();   
        await this.player.init();
        GlobalManager.engine.hideLoadingUI();
    }

    async start() {
        
        await this.init();
        
        if(DEBUG_MODE){
            Inspector.Show(GlobalManager.scene,{});
        }

        this.startTimer = 0;
        GlobalManager.engine.runRenderLoop(() => {

            GlobalManager.update();
            //console.log("delta time : "+DELTA_TIME )
            this.update();
            this.handleGamepadInput();
             
            this.actions = {};
            GlobalManager.scene.render(); 
            
        })
    }
    
    update(){
        //console.log("inputMap in Update of Game :"+this.inputMap)
        
        //rajouter les updates de toutes les entités
        this.player.update(this.inputMap,this.actions);
        this.startTimer += GlobalManager.deltaTime;
        //GlobalManager.lightTranslation();

        
    }

    async createScene() {
        
        GlobalManager.scene = new Scene(GlobalManager.engine);
        GlobalManager.scene.clearColor = new Color4(0,0,0,0);
        //GlobalManager.scene.collisionsEnabled = true;
        //GlobalManager.scene.enablePhysics(new Vector3(0, -10, 0), new AmmoJSPlugin(true, Ammo));

        //faire un cameraManager
        
        //GlobalManager.camera = new FreeCamera("camera", new Vector3(0, 5, -10), GlobalManager.scene);
        //GlobalManager.camera.attachControl(GlobalManager.canvas, true);
        
        //let light = new DirectionalLight("dirLight", new Vector3(5, -5, 0), GlobalManager.scene);
        //light.intensity = 1;
        //GlobalManager.addLight(light);
        
        /*
        let light2 = new DirectionalLight("dirLight2", new Vector3(0, -10, 0), GlobalManager.scene);
        light2.intensity = 0.7;
        GlobalManager.addLight(light2);
        */
        //marche pas du au meshChilds
        
        //let shadowGen = new ShadowGenerator(1024, GlobalManager.lights[0]);
        //shadowGen.useBlurExponentialShadowMap = true;
        //GlobalManager.addShadowGenerator(shadowGen);
        /*
        let shadowGen2 = new ShadowGenerator(1024, GlobalManager.lights[1]);
        shadowGen2.useBlurExponentialShadowMap = true;
        GlobalManager.addShadowGenerator(shadowGen2);
        */

        // Create a directional light to simulate the sun
        this.sunLight = new DirectionalLight("sunLight", new Vector3(0, -10, 0), GlobalManager.scene);
        this.sunLight.position = new Vector3(0, 10, 0);
        this.sunLight.intensity = 1;
        GlobalManager.addLight(this.sunLight);
        
        let shadowGenSun = new ShadowGenerator(1024, this.sunLight);
        shadowGenSun.useBlurExponentialShadowMap = true;
        GlobalManager.addShadowGenerator(shadowGenSun);

        var ground = MeshBuilder.CreateGround("ground", {width: 30, height: 30}, GlobalManager.scene);
        var groundMaterial = new StandardMaterial("groundMaterial");
        groundMaterial.diffuseColor = new Color3( 0, 0, 1);
        ground.material = groundMaterial
        ground.receiveShadows = true;
        
        if (DEBUG_MODE){
            
            this.axesWorld = new AxesViewer(GlobalManager.scene, 4);
            //ground grid pour debug
            var groundMaterial = new GridMaterial("groundMaterial");
            groundMaterial.diffuseColor = new Color3(0, 0, 1);
            ground.material = groundMaterial;    
        }
        
        let mesh = MeshBuilder.CreateBox("box", { size: 1 }, GlobalManager.scene);
        mesh.position.y = 1;
        GlobalManager.addShadowCaster(mesh, true);
    }
    initKeyboard(){
        GlobalManager.scene.onKeyboardObservable.add((kbInfo) => {
            switch (kbInfo.type) {
                case KeyboardEventTypes.KEYDOWN :
                    this.inputMap[kbInfo.event.code] = true;
                    //console.log("keyDOWN"+kbInfo.event.code);
                    break;
                case KeyboardEventTypes.KEYUP :
                    this.inputMap[kbInfo.event.code] = false;
                    this.actions[kbInfo.event.code] = true;
                    //console.log("keyUP"+kbInfo.event.code);
                    break;
            }
        })
    }

    initGamepad() {
        this.gamepadManager = new GamepadManager();
        console.log("GamepadManager created");
        this.gamepadManager.onGamepadConnectedObservable.add((gamepad) => {
            console.log("Gamepad connected: " + gamepad.type);
            if (gamepad.type === Gamepad.DUALSHOCK) {
                this.gamepad = gamepad;
                console.log("Gamepad connected: " + gamepad.id);
            }
        });
    }

    handleGamepadInput() {
        if (this.gamepad) {
            const leftStick = this.gamepad.leftStick;
            const rightStick = this.gamepad.rightStick;
            
            // Handle gamepad input
            this.inputMap["leftStickX"] = leftStick.x;
            this.inputMap["leftStickY"] = leftStick.y;
            this.inputMap["rightStickX"] = rightStick.x;
            this.inputMap["rightStickY"] = rightStick.y;
            //console.log("leftStickX : "+leftStick.x + " leftStickY : "+leftStick.y);
        }
    }

}
export {DEBUG_MODE}
