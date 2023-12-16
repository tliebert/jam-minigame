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
  moveOnButton;
  gameOverBanner;
  gameFinishedBanner;
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
  speedFactorAdjustment = 10; //speed absolute value divided by this #
  speedMax = 1500;
  speedMultiplier = 75;
  physicsMultiplier = 75;
  timerText;
  timerStarted = false;
  countdownTime = 60;

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
      "../../assets/minigame_initial_message.png"
    );

    // crashed
    this.load.image(
      this.assets.scene.gameOver,
      "../../assets/crashed_message.png"
    );

    this.load.image(
      this.assets.scene.restart,
      "../../assets/try_again_button.png"
    );

    // minigame finished
    this.load.image("continue", "../../assets/continue_message.png");

    // Character
    this.load.spritesheet(
      this.assets.bird.red,
      "../../assets/bird-red-sprite.png",
      {
        frameWidth: 34,
        frameHeight: 24,
      }
    );

    this.load.svg("car", "../../assets/car.svg", { width: 200, height: 200 });

    this.load.svg("hat", "../../assets/icon_hat_and_shirts.svg", {
      width: 30,
      height: 30,
    });

    this.load.svg("shirt", "../../assets/shirt.svg", {
      width: 30,
      height: 30,
    });

    // resources

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

    // hat and top logo

    // this.load.svg("hat", "../../assets/sweets.svg", {
    //   width: this.iconWidth,
    //   height: this.iconHeight,
    // });
  }

  create() {
    this.backgroundDay = this.add
      .image(960, 540, this.assets.scene.background.day)
      .setInteractive();
    this.backgroundDay.on("pointerdown", this.moveCharacter);

    if (!this.resourceObject) {
      this.resourceObject = {
        resourcenames: ["sweets", "western", "computer", "flower"],
        sweets: [0, 0],
        western: [0, 0],
        computer: [0, 0],
        flower: [0, 0],
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

    this.gameFinishedBanner = this.add
      .image(this.assets.scene.width / 2, 540, "continue")
      .setInteractive();
    this.gameFinishedBanner.visible = false;
    this.gameFinishedBanner.setDepth(20);
    this.gameFinishedBanner.on("pointerdown", this.transitionToNextScene);

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
      fontFamily: "Arial",
      fontSize: "32px",
      fill: "#fff",
    });

    // Set the initial countdown time to 60 seconds (1 minute)
  }

  update(time, delta) {
    let that = this;

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

    // this.coinsGroup.children.iterate((child) => {
    //   child.body.setVelocityX((-velocity / this.speedFactorAdjustment) * delta);
    // });

    this.resourceGroup.children.iterate((child) => {
      child.body.setVelocityX((-velocity / this.speedFactorAdjustment) * delta);
    });

    if (this.player.body.checkWorldBounds()) {
      this.characterCollision();
    }

    this.nextWave++;

    if (this.nextWave === 130) {
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

  gameFinished = () => {
    console.log("game finished");
    this.physics.pause();

    this.gameOver = true;
    this.gameStarted = false;

    this.gameOverBanner.visible = false;
    this.restartButton.visible = false;
    this.gameFinishedBanner.visible = true;
  };

  updateScoreboard = () => {
    const scoreBoardNameTranslations = {
      sweets: "Athleisure",
      western: "Western",
      flower: "Cottagecore",
      computer: "Y2K",
    };

    this.resourceScoreboard.clear(true, true);

    let initialPosition = 200;

    this.resourceObject.resourcenames.forEach((resourcename) => {
      // Create a container to group text and image
      const container = this.add.container(initialPosition, 30);

      // Create an image using the imported SVG texture
      const styleName = this.add.text(
        0,
        0,
        scoreBoardNameTranslations[resourcename],
        {
          fontFamily: "Arial",
          fontSize: "30px",
          fill: "#fff",
        }
      );

      const hatLogo = this.add.image(styleName.width + 20, 20, "hat");

      const hatNumber = this.add.text(
        hatLogo.x + hatLogo.width + 10,
        0,
        `${this.resourceObject[resourcename][0]}`,
        {
          fontFamily: "Arial",
          fontSize: "30px",
          fill: "#fff",
        }
      );

      const topLogo = this.add.image(
        hatNumber.x + (hatNumber.width + 30),
        20,
        "shirt"
      );

      const topNumber = this.add.text(
        topLogo.x + topLogo.width + 10,
        0,
        `${this.resourceObject[resourcename][1]}`,
        {
          fontFamily: "Arial",
          fontSize: "30px",
          fill: "#fff",
        }
      );

      container.add([styleName, hatLogo, hatNumber, topLogo, topNumber]);

      this.resourceScoreboard.add(container); // add the container to the scoreboard

      // why do containers have zero width. This is javascript.

      let totalWidth = [
        styleName,
        hatLogo,
        hatNumber,
        topLogo,
        topNumber,
      ].reduce((acc, curr) => {
        return (acc += curr.width);
      }, 0);

      initialPosition += totalWidth + 100;
    });

    // const scoreBoardNameTranslations = {
    //   sweets: "Athleisure",
    //   western: "Western",
    //   flower: "Cottagecore",
    //   computer: "Y2K",
    // };

    // this.resourceScoreboard.clear(true, true);

    // let initialPosition = this.assets.scene.width - 50;

    // // this.resourceObject.resourcenames

    // ["sweets"].forEach((resourcename) => {
    //   // Create a container to group text and image
    //   const container = this.add.container(initialPosition, 30);

    //   // Create an image using the imported SVG texture

    //   const styleName = this.add
    //     .text`${scoreBoardNameTranslations[resourcename]}`;
    //   const hatLogo = this.add.image(0, 0, "sweets"); //logo.setScale if needed
    //   const topLogo = this.add.image(0, 0, "western");
    //   const hatNumber = this.add.text(
    //     0,
    //     0,
    //     `${this.resourceObject[resourcename][0]}`,
    //     {
    //       fontFamily: "Arial",
    //       fontSize: "30px",
    //       fill: "#fff",
    //     }
    //   );

    //   const topNumber = this.add.text(
    //     0,
    //     0,
    //     `${this.resourceObject[resourcename][1]}`,
    //     {
    //       fontFamily: "Arial",
    //       fontSize: "30px",
    //       fill: "#fff",
    //     }
    //   );
    //   container.add([styleName, hatLogo, hatNumber, topLogo, topNumber]); // add both image and text to the container

    //   this.resourceScoreboard.add(container); // add the container to the scoreboard

    //   initialPosition -= container.width + 50; // adjust the spacing
    // });

    //////////////// current code

    // this.resourceScoreboard.clear(true, true);

    // const scoreBoardNameTranslations = {
    //   sweets: "Athleisure",
    //   western: "Western",
    //   flower: "Cottagecore",
    //   computer: "Y2K",
    // };

    // // const scoreAsString = scores.toString();
    // let initialPosition = this.assets.scene.width - 50; // Initial position from the right

    // this.resourceObject.resourcenames.forEach((resourcename) => {
    //   const text = this.add
    //     .text(
    //       initialPosition,
    //       30,
    //       `${scoreBoardNameTranslations[resourcename]} (Hats : ${this.resourceObject[resourcename][0]} | Tops : ${this.resourceObject[resourcename][1]})`,
    //       {
    //         fontFamily: "Arial",
    //         fontSize: "30px",
    //         fill: "#fff",
    //       }
    //     )
    //     .setOrigin(1, 0.5);
    //   this.resourceScoreboard.add(text); // what is this here?
    //   initialPosition -= text.width + 50;
    // });
  };

  updateScore = () => {
    this.updateScoreboard();
  };

  makeWave = () => {
    if (!this.gameStarted || this.gameOver) return;

    const arrayOfResourceNames = this.resourceObject["resourcenames"];
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

    if (!this.timerStarted) {
      this.time.addEvent({
        delay: 1000,
        callback: function () {
          // Update the countdown time
          this.countdownTime--;

          // Update the timer text
          var minutes = Math.floor(this.countdownTime / 60);
          var seconds = this.countdownTime % 60;
          this.timerText.setText(
            "Time: " + minutes + ":" + (seconds < 10 ? "0" : "") + seconds
          );

          // Check if the countdown has reached 0
          if (this.countdownTime <= 0) {
            // Do something when the timer reaches 0 (e.g., end the game)
            this.gameFinished();
            console.log("Time is up!");
            this.timerText.setText("Outta Time");
            // You can add more logic here for what happens when the timer reaches 0
          }
        },
        callbackScope: this,
        loop: true, // Repeat the event every second
      });

      this.timerStarted = true;
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

    const arrayOfAdds = [
      [2, 0],
      [1, 1],
      [1, 1],
      [0, 2],
    ];
    let randomIndex = Phaser.Math.Between(1, 4) - 1;

    const addArray = arrayOfAdds[randomIndex]; // [1, 1]

    this.resourceObject[key][0] += addArray[0];
    this.resourceObject[key][1] += addArray[1];

    this.updateScore();
  };

  transitionToNextScene = () => {
    console.log("hey im trying to go to the next scene");
  };

  prepareGame = () => {
    this.score = 0;
    this.gameOver = false;
    this.backgroundDay.visible = true;
    this.messageInitial.visible = true;
    this.nextWave = 0;

    this.player = this.physics.add.sprite(120, 540, "car");
    this.player.setSize(100, 60);
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
