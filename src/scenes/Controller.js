import Phaser from "../lib/phaser.js";
import Example2 from "./Example2.js";

export default class Controller extends Phaser.Scene {
  triggerTimer;
  toggle = true;

  constructor() {
    super("controller");
  }

  preload() {}

  create() {
    const intID = setInterval(this.switcher(this), 2000);
    // console.log("presumable im first");
    // setTimeout(() => {
    //   this.scene.start("example");
    // }, 2000);
    // setTimeout(() => {
    //   this.scene.switch("example2");
    // }, 4000);

    this.scene.stop("example2");

    this.triggerTimer = this.time.addEvent({
      callback: this.timerEvent,
      callbackScope: this,
      delay: 3000, // 1000 = 1 second
      loop: true,
    });
  }
  update() {
    // console.log("then me");
    // this.scene.switch("example2");
  }

  timerEvent() {
    if (this.toggle) {
      this.scene.stop("example");
      this.scene.run("example2");
      this.toggle = false;
    } else if (!this.toggle) {
      this.scene.stop("example2");
      this.scene.run("example");
      this.toggle = true;
    }
  }

  switcher(context) {
    console.log("the current key is", context.scene.key);
  }
}
