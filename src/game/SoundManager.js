import { AudioEngine,Sound } from "@babylonjs/core";
import { GlobalManager } from "./GlobalManager";



class SoundManager {
    
    AudioEngine;

    constructor(){

    }
    
    static get instance() {
        return (globalThis[Symbol.for(`PF_${SoundManager.name}`)] || new this());    
    }
    
    init(){
        this.AudioEngine = new AudioEngine();
        //console.log("AudioEngine create",this.AudioEngine)
    }

    async playSound(name,url){
        const sound = new Sound(
            name,
            url,
            GlobalManager.scene,
            () => sound.play(),
            {loop:false, volume: 0.8}
        );
    }

    /*
        permet de mettre une musique a jouer en loop 
    */
    async playMusic(name,url){
        const sound = new Sound(
            name,
            url,
            GlobalManager.scene,
            () => sound.play(),
            {loop:true, volume: 0.2}
        );
    }


    stopMusic(){
        
    }

}

const {instance} = SoundManager;
export {instance as SoundManager};