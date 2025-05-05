import { DEBUG_MODE } from "./Game";

class Score {
    constructor(GameName) {
        this.score = 0;
        this.GameName = GameName;
    }

    init() {
        
        const savedScore = localStorage.getItem(`${this.GameName}-Score`);
        this.score = savedScore ? parseInt(savedScore) : 0;

        if (DEBUG_MODE) {
            console.log('Score initialisé à:', this.score);
        }
    }

    updateScore(points) {
        this.score += points;
        this.saveToLocalStorage();

        if (DEBUG_MODE) {
            console.log('Score mis à jour:', this.score);
        }
    }

    resetScore() {
        this.score = 0;
        this.saveToLocalStorage();

        if (DEBUG_MODE) {
            console.log('Score réinitialisé.');
        }
    }

    saveToLocalStorage() {
        localStorage.setItem(this.GameName, this.score);
    }

    getScore() {
        return this.score;
    }
}

export default Score;
