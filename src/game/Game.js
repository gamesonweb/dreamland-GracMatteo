import {AxesViewer,KeyboardEventTypes, Scene ,Color4,MeshBuilder,Vector3,FreeCamera, StandardMaterial,HemisphericLight, Color3,ShadowGenerator, ReflectiveShadowMap, DirectionalLight, GamepadManager, Gamepad} from '@babylonjs/core';
import {GridMaterial} from "@babylonjs/materials";
import {Inspector} from "@babylonjs/inspector";

import Ammo from 'ammo.js'; 

import Player from './Player.js';
import Planet from './planet.js';
import { GlobalManager } from './GlobalManager.js';


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
    planet;
    dist;

    inputMap = {};
    actions = {}

    sunLight;
    

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
        this.planet = new Planet(100,9.8,new Vector3(10,0,10))
        await this.planet.init()
        this.player = new Player();   
        await this.player.init();
        GlobalManager.engine.hideLoadingUI();
    }

    getDistPlanetPlayer(playerPosition, planetPosition) {
        return playerPosition.subtract(planetPosition);
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
        this.player.update(this.inputMap,this.actions,this.planet);
        this.startTimer += GlobalManager.deltaTime;
        //console.log(this.getDistPlanetPlayer(this.player.mesh.position,this.planet.position))
        //GlobalManager.lightTranslation();

        
    }

    async createScene() {
        
        GlobalManager.scene = new Scene(GlobalManager.engine);
        GlobalManager.scene.clearColor = new Color4(0,0,0,0);
        GlobalManager.scene.collisionsEnabled = true;
        //GlobalManager.scene.enablePhysics(new Vector3(0, -10, 0), new AmmoJSPlugin(true, Ammo));

        //faire un cameraManager
        
        //GlobalManager.camera = new FreeCamera("camera", new Vector3(0, 5, -10), GlobalManager.scene);
        //GlobalManager.camera.attachControl(GlobalManager.canvas, true);
        
        

        // Create a directional light to simulate the sun
        this.sunLight = new DirectionalLight("sunLight", new Vector3(0, -10, -10), GlobalManager.scene);
        this.sunLight.position = new Vector3(0, 10, 0);
        this.sunLight.intensity = 1;
        GlobalManager.addLight(this.sunLight);
        
        let shadowGenSun = new ShadowGenerator(2048, this.sunLight);
        shadowGenSun.useExponentialShadowMap = true;
        shadowGenSun.bias = 0.01;
        shadowGenSun.normalBias = 0.02;

        GlobalManager.addShadowGenerator(shadowGenSun);

        var ground = MeshBuilder.CreateGround("ground", {width: 30, height: 30}, GlobalManager.scene);
        var groundMaterial = new StandardMaterial("groundMaterial");
        groundMaterial.diffuseColor = new Color3( 0, 0, 1);
        ground.material = groundMaterial
        ground.receiveShadows = true;
        ground.checkCollisions = true;
        
        if (DEBUG_MODE){
            
            this.axesWorld = new AxesViewer(GlobalManager.scene, 4);
            //ground grid pour debug
            var groundMaterial = new GridMaterial("groundMaterial");
            groundMaterial.diffuseColor = new Color3(0, 0, 1);
            ground.material = groundMaterial;    
        }
        
        let mesh = MeshBuilder.CreateBox("box", { size: 1 }, GlobalManager.scene);
        mesh.position.y = 1;
        mesh.checkCollisions = true;
        GlobalManager.addShadowCaster(mesh, true);
        
        let mesh2 = MeshBuilder.CreateCylinder("cylinder", { height: 2, diameter: 0.5 }, GlobalManager.scene);
        mesh2.position.y = 1;
        mesh2.position.x = 5;
        mesh2.receiveShadows = true;
        mesh2.checkCollisions = true;

        const material = new BABYLON.StandardMaterial("mat", GlobalManager.scene);
        material.diffuseColor = new BABYLON.Color3(1, 0, 0);
        mesh2.material = material;

        GlobalManager.addShadowCaster(mesh2);
        this.createObstacles();
    }
    
    initKeyboard(){
        GlobalManager.scene.onKeyboardObservable.add((kbInfo) => {
            switch (kbInfo.type) {
                case KeyboardEventTypes.KEYDOWN :
                    this.inputMap[kbInfo.event.code] = true;
                    console.log("keyDOWN"+kbInfo.event.code);
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

    createObstacles(){
        // Créer un mur
        const wall = MeshBuilder.CreateBox("wall", { width: 3, height: 1, depth: 0.2 }, GlobalManager.scene);
        wall.position = new Vector3(0, 0.5, 2);
        wall.checkCollisions = true;
        //wall.receiveShadows = true;
        const wallMaterial = new StandardMaterial("wallMaterial", GlobalManager.scene);
        wallMaterial.diffuseColor = new Color3(0.7, 0.3, 0.3);
        wall.material = wallMaterial;
        GlobalManager.addShadowCaster(wall, true);
        // Créer une colonne
        const column = MeshBuilder.CreateCylinder("column", { height: 2, diameter: 0.5 }, GlobalManager.scene);
        column.position = new Vector3(-2, 1, -1);
        column.checkCollisions = true;
        //column.receiveShadows = true;
        GlobalManager.addShadowCaster(column, true);
        const columnMaterial = new StandardMaterial("columnMaterial", GlobalManager.scene);
        columnMaterial.diffuseColor = new Color3(0.3, 0.7, 0.3);
        column.material = columnMaterial;
        
        // Créer une boîte
        const box = MeshBuilder.CreateBox("box", { size: 0.8 }, GlobalManager.scene);
        box.position = new Vector3(2, 0.4, -1);
        box.checkCollisions = true;
        //box.receiveShadows = true;
        const boxMaterial = new StandardMaterial("boxMaterial", GlobalManager.scene);
        boxMaterial.diffuseColor = new Color3(0.3, 0.3, 0.7);
        box.material = boxMaterial;
        GlobalManager.addShadowCaster(box, true);
        
        const mesh = MeshBuilder.CreateBox("box", { size: 1 }, GlobalManager.scene);
        mesh.position.y = 1;
        //mesh.receiveShadows = true;
        GlobalManager.addShadowCaster(mesh, true);

        mesh.checkCollision = true;
        wall.checkCollisions = true;
        column.checkCollisions = true;
        box.checkCollisions = true;        
    }

    getPlanetPosition(){
        return this.planet.position
    }
    

}
export {DEBUG_MODE};