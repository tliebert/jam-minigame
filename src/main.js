import Phaser from "./lib/phaser.js";

export default new Phaser.Game({
  type: Phaser.AUTO,
  width: 480,
  height: 640,
  scene: Image,
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
