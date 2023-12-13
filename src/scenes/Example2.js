import Phaser from "../lib/phaser.js";

export default class Example2 extends Phaser.Scene {
  constructor() {
    super("example2");
  }

  preload() {
    console.log("example 2 preload");
    this.load.setBaseURL("https://labs.phaser.io");

    this.load.image("sky", "assets/skies/space3.png");
    this.load.image("logo", "assets/sprites/phaser3-logo.png");
    this.load.image("red", "assets/particles/red.png");
  }

  create() {
    this.add.image(400, 300, "logo");
  }
}
