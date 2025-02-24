import Game from "./game/Game.js";
import '@babylonjs/loaders/glTF';

async function init() {
    let canvas = document.querySelector("canvas");
    if (!canvas) {
        console.error("Canvas introuvable !");
        return;
    }

    let game = new Game(canvas);
    await game.init();
    game.start();
}

init();
//window.addEventListener("DOMContentLoaded", init());