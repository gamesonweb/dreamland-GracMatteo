import Game from "./game/Game.js";

// Bonne pratique : avoir une fonction appelée une fois
// que la page est prête, que le DOM est chargé, etc.

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


window.addEventListener("DOMContentLoaded", init());