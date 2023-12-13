import Phaser from "./lib/phaser.js";
import Example from "./scenes/Example.js";
import Example2 from "./scenes/Example2.js";
import Controller from "./scenes/Controller.js";
import Flappy from "./scenes/Flappy.js";

export default new Phaser.Game({
  type: Phaser.AUTO,
  width: 480,
  height: 640,
  scene: [Flappy, Controller, Example, Example2],
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
