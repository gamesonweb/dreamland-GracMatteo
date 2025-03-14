import Game from "./game/Game.js";
import {Engine} from '@babylonjs/core';

let engine;
let canvas;
let game;

window.onload = () => {
    canvas = document.getElementById("canvas");
    engine = new Engine(canvas, true);
    window.addEventListener("resize", function() {
        engine.resize();
    })

    game = new Game(engine, canvas);
    game.init();
    game.start();

};




