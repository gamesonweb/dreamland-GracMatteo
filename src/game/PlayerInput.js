export default class PlayerInputs {
    constructor() {
      this.keysPressed = {};
      window.addEventListener("keydown", (evt) => {
        this.keysPressed[evt.key] = true;
      });
      window.addEventListener("keyup", (evt) => {
        this.keysPressed[evt.key] = false;
      });
    }
    // Méthode utilitaire pour vérifier si une touche est pressée
    isKeyPressed(key) {
      return this.keysPressed[key] === true;
    }
  }