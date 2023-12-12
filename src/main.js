import Phaser from "./lib/phaser.js";
// import Example from "./scenes/Example.js";

class Example extends Phaser.Scene {
  constructor() {
    super();
  }

  preload() {
    console.log("in the preload of segszamle");

    this.load.image("sky", "../assets/space3.png");
  }

  create() {
    this.add.image(400, 300, "sky");
  }
}

export default new Phaser.Game({
  type: Phaser.AUTO,
  width: 480,
  height: 640,
  scene: Example,
  physics: {
    default: "arcade",
    arcade: {
      gravity: {
        y: 200,
      },
      debug: true,
    },
  },
});
