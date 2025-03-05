import Game from "./game/Game.js";
import '@babylonjs/loaders/glTF';

async function init() {
    const canvas = document.querySelector("canvas");
    if (!canvas) {
        console.error("Canvas introuvable !");
        return;
    }

    const game = new Game(canvas);
    await game.init();
    game.start();
}

init();
