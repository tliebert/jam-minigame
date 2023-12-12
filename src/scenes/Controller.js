import Phaser from "../lib/phaser.js";

export default class Controller extends Phaser.Scene {
  constructor() {
    super("controller");
  }

  preload() {}
  create() {
    setTimeout(() => {
      this.scene.start("example");
    }, 3000);
  }
  update() {}
}
