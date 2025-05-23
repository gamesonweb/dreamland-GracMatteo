


// src/Level1.js
import { SceneLoader, MeshBuilder, Vector3, StandardMaterial, Color3 } from "@babylonjs/core";
import { GlobalManager } from "./GlobalManager.js";
import Planet from "./Planet.js";
import EtoileManager from "./EtoileManager.js";

export default class Level1 {
    

    planets = [];
    etoileManager = [];

    constructor() {
    
    }

  /** Charge tous les éléments du niveau */
  async init() {
    
    this.planets.push(new Planet(50, -9.8, new Vector3(0, 5, 0)));
    

    // 3) Placer des "étoiles" à collecter
    this.etoileManager = new EtoileManager();
    await this.etoileManager.init(this.planet);

    

    // 5) Retourner la promesse pour savoir que tout est prêt
    return Promise.resolve();
  }

  /** À appeler à chaque frame depuis Game.update() */
  update(player) {
    // On peut, par exemple, vérifier si le joueur atteint certaines zones :
    this.etoileManager.update(player);
    // Ou ajouter de la logique propre au niveau :
    // if (player.position.y < -10) { respawn... }
  }

  /** Nettoyage */
  dispose() {
    this.planets.dispose();
    this.etoileManager.dispose();
  }
}
