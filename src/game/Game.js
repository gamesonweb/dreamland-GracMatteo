import { Engine, KeyboardEventTypes, Scene } from '@babylonjs/core';
import  Player  from './Player.js';
import  PlayerInput  from './PlayerInput.js';

export default class Game {
    
    engine;
    canvas;
    scene;
    
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
        this.initKeyboard();
        
    }

    async start() {
        this.startTimer = 0;
        this.engine.runRenderLoop(() => {

             let DELTA_TIME = this.engine.getDeltatime() / 1000.0
             
             this.update(DELTA_TIME);
            

             this.actions = {};
             this.scene.render(); 
            
        })
    }
    
    update(delta){

        //rajouter les updates de toutes les entités

        this.startTimer += delta;
    }


    //a mettre dans un autre fichier
    initKeyboard(){
        this.scene.onKeyboardObservable.add((kbInfo) => {
            switch (kbInfo.type) {
                case KeyboardEventTypes.KEYDOWN :
                    this.inputMap[kbInfo.event.code] = true;
                case KeyboardEventTypes.KEYUP :
                    this.inputMap[kbInfo.event.code] = false;
                    this.actions[kbInfo.event.code] = true;
                    break;
            }
        })
    }



}
