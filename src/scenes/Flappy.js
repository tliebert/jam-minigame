import Phaser from "../lib/phaser.js";

// const configurations = {
//   type: Phaser.AUTO,
//   width: 288,
//   height: 512,
//   physics: {
//     default: "arcade",
//     arcade: {
//       gravity: {
//         y: 300,
//       },
//       debug: false,
//     },
//   },
//   scene: {
//     preload: preload,
//     create: create,
//     update: update,
//   },
// };

export default class Flappy extends Phaser.Scene {
  constructor() {
    super();
  }

  assets = {
    bird: {
      red: "bird-red",
      yellow: "bird-yellow",
      blue: "bird-blue",
    },
    obstacle: {
      pipe: {
        green: {
          top: "pipe-green-top",
          bottom: "pipe-green-bottom",
        },
        red: {
          top: "pipe-red-top",
          bottom: "pipe-red-bo",
        },
      },
    },
    scene: {
      width: 1920,
      background: {
        day: "mountain-baackground",
        night: "background-night",
      },
      ground: "ground",
      gameOver: "game-over",
      restart: "restart-button",
      messageInitial: "message-initial",
    },
    scoreboard: {
      width: 25,
      base: "number",
      number0: "number0",
      number1: "number1",
      number2: "number2",
      number3: "number3",
      number4: "number4",
      number5: "number5",
      number6: "number6",
      number7: "number7",
      number8: "number8",
      number9: "number9",
    },
    animation: {
      bird: {
        red: {
          clapWings: "red-clap-wings",
          stop: "red-stop",
        },
        blue: {
          clapWings: "blue-clap-wings",
          stop: "blue-stop",
        },
        yellow: {
          clapWings: "yellow-clap-wings",
          stop: "yellow-stop",
        },
      },
      ground: {
        moving: "moving-ground",
        stop: "stop-ground",
      },
    },
  };

  gameOver;
  gameStarted;
  upButton;
  restartButton;
  gameOverBanner;
  messageInitial;
  player;
  birdName;
  framesMoveUp;
  backgroundDay;
  backgroundNight;
  ground;
  pipesGroup;
  gapsGroup;
  coin;
  coinsGroup;
  resourceGroup;
  resourceObject;
  nextPipes;
  currentPipe;
  scoreboardGroup;
  score;
  coinScore = 0;
  itemVelocity = 400;

  preload() {
    // Backgrounds and ground
    this.load.image(
      this.assets.scene.background.day,
      "../../assets/mountain-background.png"
    );
    this.load.image(
      this.assets.scene.background.night,
      "../../assets/background-night.png"
    );
    this.load.spritesheet(
      this.assets.scene.ground,
      "../../assets/ground-sprite.png",
      {
        frameWidth: 336,
        frameHeight: 112,
      }
    );

    // Pipes
    this.load.image(
      this.assets.obstacle.pipe.green.top,
      "../../assets/pipe-green-top.png"
    );
    this.load.image(
      this.assets.obstacle.pipe.green.bottom,
      "../../assets/pipe-green-bottom.png"
    );
    this.load.image(
      this.assets.obstacle.pipe.red.top,
      "../../assets/pipe-red-top.png"
    );
    this.load.image(
      this.assets.obstacle.pipe.red.bottom,
      "../../assets/pipe-red-bottom.png"
    );

    // Start game
    this.load.image(
      this.assets.scene.messageInitial,
      "../../assets/message-initial.png"
    );

    // End game
    this.load.image(this.assets.scene.gameOver, "../../assets/gameover.png");
    this.load.image(
      this.assets.scene.restart,
      "../../assets/restart-button.png"
    );

    // Birds
    this.load.spritesheet(
      this.assets.bird.red,
      "../../assets/bird-red-sprite.png",
      {
        frameWidth: 34,
        frameHeight: 24,
      }
    );
    this.load.spritesheet(
      this.assets.bird.blue,
      "../../assets/bird-blue-sprite.png",
      {
        frameWidth: 34,
        frameHeight: 24,
      }
    );
    this.load.spritesheet(
      this.assets.bird.yellow,
      "../../assets/bird-yellow-sprite.png",
      {
        frameWidth: 34,
        frameHeight: 24,
      }
    );

    this.load.image("coin", "../../assets/gold_1.png");
    this.load.image("carrot", "../../assets/bronze_1.png");
    this.load.image("bunny", "../../assets/jetpack.png");
    this.load.image("wildcard", "../../assets/silver_1.png");

    // Numbers
    this.load.image(this.assets.scoreboard.number0, "../../assets/number0.png");
    this.load.image(this.assets.scoreboard.number1, "../../assets/number1.png");
    this.load.image(this.assets.scoreboard.number2, "../../assets/number2.png");
    this.load.image(this.assets.scoreboard.number3, "../../assets/number3.png");
    this.load.image(this.assets.scoreboard.number4, "../../assets/number4.png");
    this.load.image(this.assets.scoreboard.number5, "../../assets/number5.png");
    this.load.image(this.assets.scoreboard.number6, "../../assets/number6.png");
    this.load.image(this.assets.scoreboard.number7, "../../assets/number7.png");
    this.load.image(this.assets.scoreboard.number8, "../../assets/number8.png");
    this.load.image(this.assets.scoreboard.number9, "../../assets/number9.png");
  }

  create() {
    this.backgroundDay = this.add
      .image(960, 540, this.assets.scene.background.day)
      .setInteractive();
    this.backgroundDay.on("pointerdown", this.moveBird);
    this.backgroundNight = this.add
      .image(this.assets.scene.width, 256, this.assets.scene.background.night)
      .setInteractive();
    this.backgroundNight.visible = false;
    this.backgroundNight.on("pointerdown", this.moveBird);

    if (!this.resourceObject) {
      this.resourceObject = {
        carrot: 0,
        coin: 0,
        bunny: 0,
        wildcard: 0,
      };
    }

    this.gapsGroup = this.physics.add.group();
    this.pipesGroup = this.physics.add.group();
    this.coinsGroup = this.physics.add.group();
    this.resourceGroup = this.physics.add.group();

    this.scoreboardGroup = this.physics.add.staticGroup();
    this.ground = this.physics.add.sprite(
      this.assets.scene.width,
      458,
      this.assets.scene.ground
    );
    this.ground.setCollideWorldBounds(true);
    this.ground.setDepth(10);

    this.messageInitial = this.add.image(
      this.assets.scene.width,
      156,
      this.assets.scene.messageInitial
    );
    this.messageInitial.setDepth(30);
    this.messageInitial.visible = false;

    this.upButton = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.UP
    );

    // Ground animations
    this.anims.create({
      key: this.assets.animation.ground.moving,
      frames: this.anims.generateFrameNumbers(this.assets.scene.ground, {
        start: 0,
        end: 2,
      }),
      frameRate: 15,
      repeat: -1,
    });
    this.anims.create({
      key: this.assets.animation.ground.stop,
      frames: [
        {
          key: this.assets.scene.ground,
          frame: 0,
        },
      ],
      frameRate: 20,
    });

    // Red Bird Animations
    this.anims.create({
      key: this.assets.animation.bird.red.clapWings,
      frames: this.anims.generateFrameNumbers(this.assets.bird.red, {
        start: 0,
        end: 2,
      }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: this.assets.animation.bird.red.stop,
      frames: [
        {
          key: this.assets.bird.red,
          frame: 1,
        },
      ],
      frameRate: 20,
    });

    // Blue Bird animations
    this.anims.create({
      key: this.assets.animation.bird.blue.clapWings,
      frames: this.anims.generateFrameNumbers(this.assets.bird.blue, {
        start: 0,
        end: 2,
      }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: this.assets.animation.bird.blue.stop,
      frames: [
        {
          key: this.assets.bird.blue,
          frame: 1,
        },
      ],
      frameRate: 20,
    });

    // Yellow Bird animations
    this.anims.create({
      key: this.assets.animation.bird.yellow.clapWings,
      frames: this.anims.generateFrameNumbers(this.assets.bird.yellow, {
        start: 0,
        end: 2,
      }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: this.assets.animation.bird.yellow.stop,
      frames: [
        {
          key: this.assets.bird.yellow,
          frame: 1,
        },
      ],
      frameRate: 20,
    });

    this.prepareGame(this);

    this.gameOverBanner = this.add.image(
      this.assets.scene.width,
      206,
      this.assets.scene.gameOver
    );
    this.gameOverBanner.setDepth(20);
    this.gameOverBanner.visible = false;

    this.restartButton = this.add
      .image(this.assets.scene.width, 300, this.assets.scene.restart)
      .setInteractive();
    this.restartButton.on("pointerdown", this.restartGame);
    this.restartButton.setDepth(20);
    this.restartButton.visible = false;
  }

  update() {
    let velocity = this.itemVelocity;
    if (this.gameOver || !this.gameStarted) return;

    if (this.framesMoveUp > 0) {
      this.framesMoveUp--;
    } else if (Phaser.Input.Keyboard.JustDown(this.upButton)) {
      this.moveBird();
    } else {
      this.player.setVelocityY(120);

      if (this.player.angle < 90) {
        this.player.angle += 1;
      }
    }

    this.pipesGroup.children.iterate(function (child) {
      if (child == undefined) return;

      if (child.x < -50) child.destroy();
      else child.setVelocityX(-velocity);
    });

    this.gapsGroup.children.iterate(function (child) {
      child.body.setVelocityX(-velocity);
    });

    this.coinsGroup.children.iterate(function (child) {
      child.body.setVelocityX(-velocity);
    });

    this.resourceGroup.children.iterate(function (child) {
      child.body.setVelocityX(-velocity);
    });

    this.nextPipes++;

    if (this.nextPipes === 130) {
      this.makePipes();
      this.nextPipes = 0;
    }
  }

  /**
   *  Bird collision event.
   *  @param {object} player - Game object that collided, in this case the bird.
   */

  hitBird = () => {
    console.log(this);
    this.physics.pause();

    this.gameOver = true;
    this.gameStarted = false;

    this.player.anims.play(this.getAnimationBird(this.birdName).stop);
    this.ground.anims.play(this.assets.animation.ground.stop);

    this.gameOverBanner.visible = true;
    this.restartButton.visible = true;
  };

  /**
   *   Update the scoreboard.
   *   @param {object} _ - Game object that overlapped, in this case the bird (ignored).
   *   @param {object} gap - Game object that was overlapped, in this case the gap.
   */
  updateScoreboard = () => {
    this.scoreboardGroup.clear(true, true);

    const scoreAsString = this.score.toString();
    if (scoreAsString.length == 1) {
      this.scoreboardGroup
        .create(
          this.assets.scene.width,
          30,
          this.assets.scoreboard.base + this.score
        )
        .setDepth(10);
    } else {
      let initialPosition =
        this.assets.scene.width -
        (this.score.toString().length * this.assets.scoreboard.width) / 2;

      for (let i = 0; i < scoreAsString.length; i++) {
        this.scoreboardGroup
          .create(
            initialPosition,
            30,
            this.assets.scoreboard.base + scoreAsString[i]
          )
          .setDepth(10);
        initialPosition += this.assets.scoreboard.width;
      }
    }
  };

  updateScore = (_, gap) => {
    this.score++;
    gap.destroy();

    if (this.score % 10 == 0) {
      this.backgroundDay.visible = !this.backgroundDay.visible;
      this.backgroundNight.visible = !this.backgroundNight.visible;

      if (this.currentPipe === this.assets.obstacle.pipe.green)
        this.currentPipe = this.assets.obstacle.pipe.red;
      else this.currentPipe = this.assets.obstacle.pipe.green;
    }

    console.log(this);
    this.updateScoreboard();
  };

  /**
   * Create pipes and gap in the game.
   * @param {object} scene - Game scene.
   */
  makePipes = () => {
    if (!this.gameStarted || this.gameOver) return;

    const coin = this.physics.add.sprite(1920, 540, "coin");
    this.coinsGroup.add(coin);
    coin.body.allowGravity = false;

    const arrayOfResourceNames = ["carrot", "coin", "bunny", "wildcard"];
    const arrayOfYValues = [135, 405, 675, 945];

    const objectsToCreate = arrayOfResourceNames.map((iconName) => {
      let index = Phaser.Math.Between(0, arrayOfYValues.length - 1);
      let xvalue = arrayOfYValues.splice(index, 1);
      return [iconName, Number(xvalue)];
    });

    console.log(objectsToCreate);

    let groupOfResources = this.resourceGroup;

    objectsToCreate.forEach((iconAndXPositionArray) => {
      let resource = this.physics.add.sprite(
        1920,
        iconAndXPositionArray[1],
        iconAndXPositionArray[0]
      );
      groupOfResources.add(resource);
      resource.body.allowGravity = false;
    });

    // const pipeTopY = Phaser.Math.Between(-120, 120);

    // const gap = this.add.line(288, pipeTopY + 210, 0, 0, 0, 98);
    // this.gapsGroup.add(gap);
    // gap.body.allowGravity = false;
    // gap.visible = false;

    // const pipeTop = this.pipesGroup.create(288, pipeTopY, this.currentPipe.top);
    // pipeTop.body.allowGravity = false;

    // const pipeBottom = this.pipesGroup.create(
    //   288,
    //   pipeTopY + 920,
    //   this.currentPipe.bottom
    // );
    // pipeBottom.body.allowGravity = false;
  };

  makeRings = () => {};

  /**
   * Move the bird in the screen.
   */
  moveBird = () => {
    if (this.gameOver) {
      return;
    }

    if (!this.gameStarted) {
      console.log(this);
      this.startGame();
    }

    this.player.setVelocityY(-400);
    this.player.angle = -15;
    this.framesMoveUp = 5; // vertical rise of bird on click
  };

  /**
   * Get a random bird color.
   * @return {string} Bird color asset.
   */
  getRandomBird() {
    switch (Phaser.Math.Between(0, 2)) {
      case 0:
        return this.assets.bird.red;
      case 1:
        return this.assets.bird.blue;
      case 2:
      default:
        return this.assets.bird.yellow;
    }
  }

  /**
   * Get the animation name from the bird.
   * @param {string} birdColor - Game bird color asset.
   * @return {object} - Bird animation asset.
   */
  getAnimationBird(birdColor) {
    switch (birdColor) {
      case this.assets.bird.red:
        return this.assets.animation.bird.red;
      case this.assets.bird.blue:
        return this.assets.animation.bird.blue;
      case this.assets.bird.yellow:
      default:
        return this.assets.animation.bird.yellow;
    }
  }

  /**
   * Update the game scoreboard.
   */

  /**
   * Restart the game.
   * Clean all groups, hide game over objects and stop game physics.
   */
  restartGame = () => {
    this.pipesGroup.clear(true, true);
    this.pipesGroup.clear(true, true);
    this.gapsGroup.clear(true, true);
    this.scoreboardGroup.clear(true, true);
    this.player.destroy();
    this.gameOverBanner.visible = false;
    this.restartButton.visible = false;

    const gameScene = this;
    this.prepareGame();

    gameScene.physics.resume();
  };

  handleCoinCollision = (player, coin) => {
    this.physics.world.disableBody(coin.body);
    console.log("coin in coin collision", coin.gameObject);
    coin.destroy();
    this.coinScore++;
    console.log(this.coinScore);
  };

  handleResourceCollision = (player, resource) => {
    this.physics.world.disableBody(resource.body);
    console.log(resource);
    console.log(resource.texture.key);
    let key = resource.texture.key;
    resource.destroy();
    this.resourceObject[key]++;
    console.log(this.resourceObject);
  };

  /**
   * Restart all variable and configurations, show main and recreate the bird.
   * @param {object} scene - Game scene.
   */
  prepareGame = () => {
    this.framesMoveUp = 0;
    this.nextPipes = 0;
    this.currentPipe = this.assets.obstacle.pipe.green;
    this.score = 0;
    this.gameOver = false;
    this.backgroundDay.visible = true;
    this.backgroundNight.visible = false;
    this.messageInitial.visible = true;

    this.birdName = this.getRandomBird();
    this.player = this.physics.add.sprite(60, 265, this.birdName);
    this.player.setCollideWorldBounds(true);
    this.player.anims.play(
      this.getAnimationBird(this.birdName).clapWings,
      true
    );
    this.player.body.allowGravity = false;

    this.physics.add.collider(
      this.player,
      this.ground,
      this.hitBird,
      null,
      this.scene
    );

    this.physics.add.collider(
      this.player,
      this.pipesGroup,
      this.hitBird,
      null,
      this.scene
    );

    this.physics.add.overlap(
      this.player,
      this.gapsGroup,
      this.updateScore,
      null,
      this.scene
    );

    this.physics.add.overlap(
      this.player,
      this.coinsGroup,
      this.handleCoinCollision,
      null,
      this.scene
    );

    this.physics.add.overlap(
      this.player,
      this.resourceGroup,
      this.handleResourceCollision,
      null,
      this.scene
    );

    this.ground.anims.play(this.assets.animation.ground.moving, true);
  };

  /**
   * Start the game, create pipes and hide the main menu.
   * @param {object} scene - Game scene.
   */

  startGame = () => {
    console.log("start game function reached");
    // change from scene to nothing?
    this.gameStarted = true;
    this.messageInitial.visible = false;

    const score0 = this.scoreboardGroup.create(
      this.assets.scene.width,
      30,
      this.assets.scoreboard.number0
    );
    score0.setDepth(20);

    this.makePipes();
  };
}
