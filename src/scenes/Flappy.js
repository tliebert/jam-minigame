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
  };

  gameOver;
  gameStarted;
  upButton;
  restartButton;
  gameOverBanner;
  messageInitial;
  player;
  birdName;
  backgroundDay;
  ground;
  nextPipes;
  gapsGroup;
  coin;
  coinsGroup;
  resourceGroup;
  resourceObject;
  resourceScoreboard;
  scoreboardGroup;
  score;
  gravityToggle = false;
  coinScore = 0;
  itemVelocity = 400;

  preload() {
    // Backgrounds and ground
    this.load.image(
      this.assets.scene.background.day,
      "../../assets/mountain-background.png"
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
  }

  create() {
    this.backgroundDay = this.add
      .image(960, 540, this.assets.scene.background.day)
      .setInteractive();
    this.backgroundDay.on("pointerdown", this.moveBird);

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

    // this.scoreboardGroup = this.physics.add.staticGroup();
    this.resourceScoreboard = this.add.group();

    this.messageInitial = this.add.image(
      this.assets.scene.width / 2,
      540,
      this.assets.scene.messageInitial
    );
    this.messageInitial.setDepth(30);
    this.messageInitial.visible = false;

    this.upButton = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.UP
    );

    this.prepareGame(this);
    // this.player.on("worldbounds", this.hitBird, this);

    this.gameOverBanner = this.add.image(
      this.assets.scene.width / 2,
      540,
      this.assets.scene.gameOver
    );
    this.gameOverBanner.setDepth(20);
    this.gameOverBanner.visible = false;

    this.restartButton = this.add
      .image(this.assets.scene.width / 2, 640, this.assets.scene.restart)
      .setInteractive();
    this.restartButton.on("pointerdown", this.restartGame);
    this.restartButton.setDepth(20);
    this.restartButton.visible = false;
  }

  update() {
    let velocity = this.itemVelocity;

    if (this.gameOver || !this.gameStarted) return;

    if (this.input.activePointer.leftButtonDown()) {
      console.log("left clicker down");
      //   this.player.setVelocityY(300);
      this.physics.world.gravity.y = 400;
    } else {
      this.physics.world.gravity.y = -400;
    }
    //  else {
    // //   this.physics.world.gravity.y = 200;
    // // }

    this.pipesGroup.children.iterate(function (child) {
      if (child == undefined) return;

      if (child.x < -50) child.destroy();
      else child.setVelocityX(-velocity); // velocicty times delta.
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

    if (this.player.body.checkWorldBounds()) {
      this.hitBird();
    }

    this.nextPipes++;
    console.log(this.nextPipes);

    if (this.nextPipes === 130) {
      console.log("in update, making pipes");
      this.makePipes();
      this.nextPipes = 0;
    }
  }

  // Bird collides w/ something

  hitBird = () => {
    console.log("hitBird triggered");
    this.physics.pause();

    this.gameOver = true;
    this.gameStarted = false;

    this.gameOverBanner.visible = true;
    this.restartButton.visible = true;
  };

  updateScoreboard = () => {
    this.resourceScoreboard.clear(true, true);

    // const scoreAsString = scores.toString();
    let initialPosition = this.assets.scene.width / 2; // Initial position from the right

    for (const key in this.resourceObject) {
      if (this.resourceObject.hasOwnProperty(key)) {
        const text = this.add
          .text(initialPosition, 30, `${key}: ${this.resourceObject[key]}`, {
            fontFamily: "Arial",
            fontSize: "16px",
            fill: "#fff",
          })
          .setOrigin(1, 0.5); // Right-aligned text

        this.resourceScoreboard.add(text);

        initialPosition -= 100; // Adjust as needed based on your layout
      }
    }
  };

  updateScore = () => {
    this.updateScoreboard();
  };

  makePipes = () => {
    if (!this.gameStarted || this.gameOver) return;

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
  };

  moveBird = () => {
    if (this.gameOver) {
      return;
    }

    if (!this.gameStarted) {
      console.log("game started");
      this.startGame();
    }
  };

  getRandomBird() {
    return this.assets.bird.red;
  }

  restartGame = () => {
    this.pipesGroup.clear(true, true);
    this.gapsGroup.clear(true, true);
    // this.scoreboardGroup.clear(true, true);
    this.resourceGroup.clear(true, true);
    this.player.destroy();
    this.gameOverBanner.visible = false;
    this.restartButton.visible = false;

    const gameScene = this;
    this.prepareGame();

    gameScene.physics.resume();
  };

  handleCoinCollision = (player, coin) => {
    this.physics.world.disableBody(coin.body);
    coin.destroy();
    this.coinScore++;
    console.log(this.coinScore);
  };

  // this handles all collisions with collectable icons

  handleResourceCollision = (player, resource) => {
    this.physics.world.disableBody(resource.body);
    let key = resource.texture.key;
    resource.destroy();
    this.resourceObject[key]++;
    this.updateScore();
  };

  prepareGame = () => {
    this.score = 0;
    this.gameOver = false;
    this.backgroundDay.visible = true;
    this.messageInitial.visible = true;
    this.nextPipes = 0;

    this.birdName = this.getRandomBird();
    this.player = this.physics.add.sprite(60, 265, this.birdName);
    // this.player.setCollideWorldBounds(true);

    this.player.body.allowGravity = true;

    // add colliders and overlaps.

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

    // this.ground.anims.play(this.assets.animation.ground.moving, true);
  };

  startGame = () => {
    console.log("start game function reached");
    // change from scene to nothing?
    this.gameStarted = true;
    this.messageInitial.visible = false;

    this.updateScore();

    this.makePipes();
  };
}
