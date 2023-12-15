import Phaser from "../lib/phaser.js";

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
  nextWave;
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
  itemVelocity = 450;
  iconWidth = 100;
  iconHeight = 100;
  physicsStrengthInitial = 300;
  physicsStrength = 300;
  physicsMax = 1500;
  speedInitial = 450;
  speedMax = 1500;
  speedMultiplier = 75;
  physicsMultiplier = 75;
  timerText;

  preload() {
    // Backgrounds and ground
    this.load.svg(
      this.assets.scene.background.day,
      "../../assets/background.svg",
      {
        width: 1920,
        height: 1080,
      }
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

    // Character
    this.load.spritesheet(
      this.assets.bird.red,
      "../../assets/bird-red-sprite.png",
      {
        frameWidth: 34,
        frameHeight: 24,
      }
    );

    this.load.svg("car", "../../assets/car.svg", { width: 150, height: 150 });

    this.load.svg("sweets", "../../assets/sweets.svg", {
      width: this.iconWidth,
      height: this.iconHeight,
    });
    this.load.svg("western", "../../assets/western.svg", {
      width: this.iconWidth,
      height: this.iconHeight,
    });
    this.load.svg("flower", "../../assets/flower.svg", {
      width: this.iconWidth,
      height: this.iconHeight,
    });
    this.load.svg("computer", "../../assets/computer.svg", {
      width: this.iconWidth,
      height: this.iconHeight,
    });
  }

  create() {
    this.backgroundDay = this.add
      .image(960, 540, this.assets.scene.background.day)
      .setInteractive();
    this.backgroundDay.on("pointerdown", this.moveCharacter);

    if (!this.resourceObject) {
      this.resourceObject = {
        sweets: 0,
        computer: 0,
        flower: 0,
        western: 0,
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
    // this.player.on("worldbounds", this.characterCollision, this);

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

    //Timer

    this.timerText = this.add.text(16, 16, "Time: 1:00", {
      fontSize: "32px",
      fill: "#fff",
    });

    // Set the initial countdown time to 60 seconds (1 minute)

    var countdownTime = 60;

    this.time.addEvent({
      delay: 1000,
      callback: function () {
        // Update the countdown time
        countdownTime--;

        // Update the timer text
        var minutes = Math.floor(countdownTime / 60);
        var seconds = countdownTime % 60;
        this.timerText.setText(
          "Time: " + minutes + ":" + (seconds < 10 ? "0" : "") + seconds
        );

        // Check if the countdown has reached 0
        if (countdownTime <= 0) {
          // Do something when the timer reaches 0 (e.g., end the game)
          this.characterCollision();
          console.log("Time is up!");
          this.timerText.setText("Outta Time");
          // You can add more logic here for what happens when the timer reaches 0
        }
      },
      callbackScope: this,
      loop: true, // Repeat the event every second
    });
  }

  update() {
    let velocity = this.itemVelocity;

    if (this.gameOver || !this.gameStarted) return;

    if (this.input.activePointer.leftButtonDown()) {
      //   this.player.setVelocityY(300);
      this.physics.world.gravity.y = this.physicsStrength;
    } else {
      this.physics.world.gravity.y = -this.physicsStrength;
    }
    //  else {
    // //   this.physics.world.gravity.y = 200;
    // // }

    this.coinsGroup.children.iterate(function (child) {
      child.body.setVelocityX(-velocity);
    });

    this.resourceGroup.children.iterate(function (child) {
      child.body.setVelocityX(-velocity);
    });

    if (this.player.body.checkWorldBounds()) {
      this.characterCollision();
    }

    this.nextWave++;

    if (this.nextWave === 130) {
      console.log("in update, making pipes");
      this.makeWave();
      this.nextWave = 0;
    }
  }

  // character collides w/ something

  characterCollision = () => {
    console.log("characterCollision triggered");
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

  makeWave = () => {
    if (!this.gameStarted || this.gameOver) return;

    const arrayOfResourceNames = ["sweets", "western", "computer", "flower"];
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

  moveCharacter = () => {
    if (this.gameOver) {
      return;
    }

    if (!this.gameStarted) {
      console.log("game started");
      this.startGame();
    }
  };

  restartGame = () => {
    this.pipesGroup.clear(true, true);
    this.gapsGroup.clear(true, true);
    // this.scoreboardGroup.clear(true, true);
    this.resourceGroup.clear(true, true);
    this.player.destroy();
    this.gameOverBanner.visible = false;
    this.restartButton.visible = false;

    this.itemVelocity = this.speedInitial;
    this.physicsStrength = this.physicsStrengthInitial;

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

  triggerSpeedAndVelocityIncrease = () => {
    if (this.itemVelocity < this.speedMax) {
      this.itemVelocity += this.speedMultiplier;
      console.log("itemVelocity", this.itemVelocity);
    }
    if (this.physicsStrength < this.physicsMax) {
      this.physicsStrength += this.physicsMultiplier;
      console.log("physics strength", this.physicsStrength);
    }
  };

  // this handles all collisions with collectable icons

  handleResourceCollision = (player, resource) => {
    this.physics.world.disableBody(resource.body);
    let key = resource.texture.key;
    resource.destroy();
    this.triggerSpeedAndVelocityIncrease();
    this.resourceObject[key]++;
    this.updateScore();
  };

  prepareGame = () => {
    this.score = 0;
    this.gameOver = false;
    this.backgroundDay.visible = true;
    this.messageInitial.visible = true;
    this.nextWave = 0;

    this.player = this.physics.add.sprite(120, 540, "car");
    // this.player.setCollideWorldBounds(true);

    this.player.body.allowGravity = false;

    // add colliders and overlaps.

    this.physics.add.collider(
      this.player,
      this.ground,
      this.characterCollision,
      null,
      this.scene
    );

    this.physics.add.collider(
      this.player,
      this.pipesGroup,
      this.characterCollision,
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
    this.player.body.allowGravity = true;

    // change from scene to nothing?
    this.gameStarted = true;
    this.messageInitial.visible = false;

    this.updateScore();

    this.makeWave();
  };
}
