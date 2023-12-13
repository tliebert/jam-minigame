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
      width: 144,
      background: {
        day: "background-day",
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
  nextPipes;
  currentPipe;
  scoreboardGroup;
  score;

  preload() {
    // Backgrounds and ground
    this.load.image(
      this.assets.scene.background.day,
      "../../assets/background-day.png"
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
      .image(this.assets.scene.width, 256, this.assets.scene.background.day)
      .setInteractive();
    this.backgroundDay.on("pointerdown", this.moveBird);
    this.backgroundNight = this.add
      .image(this.assets.scene.width, 256, this.assets.scene.background.night)
      .setInteractive();
    this.backgroundNight.visible = false;
    this.backgroundNight.on("pointerdown", this.moveBird);

    this.gapsGroup = this.physics.add.group();
    this.pipesGroup = this.physics.add.group();
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

    gameOverBanner = this.add.image(
      this.assets.scene.width,
      206,
      this.assets.scene.gameOver
    );
    gameOverBanner.setDepth(20);
    gameOverBanner.visible = false;

    restartButton = this.add
      .image(this.assets.scene.width, 300, this.assets.scene.restart)
      .setInteractive();
    restartButton.on("pointerdown", restartGame);
    restartButton.setDepth(20);
    restartButton.visible = false;
  }

  update() {
    if (gameOver || !gameStarted) return;

    if (framesMoveUp > 0) framesMoveUp--;
    else if (Phaser.Input.Keyboard.JustDown(upButton)) this.moveBird();
    else {
      player.setVelocityY(120);

      if (player.angle < 90) player.angle += 1;
    }

    pipesGroup.children.iterate(function (child) {
      if (child == undefined) return;

      if (child.x < -50) child.destroy();
      else child.setVelocityX(-100);
    });

    gapsGroup.children.iterate(function (child) {
      child.body.setVelocityX(-100);
    });

    nextPipes++;
    if (nextPipes === 130) {
      makePipes(game.scene.scenes[0]);
      nextPipes = 0;
    }
  }

  /**
   *  Bird collision event.
   *  @param {object} player - Game object that collided, in this case the bird.
   */

  hitBird(player) {
    this.physics.pause();

    gameOver = true;
    gameStarted = false;

    player.anims.play(getAnimationBird(birdName).stop);
    ground.anims.play(this.assets.animation.ground.stop);

    gameOverBanner.visible = true;
    restartButton.visible = true;
  }

  /**
   *   Update the scoreboard.
   *   @param {object} _ - Game object that overlapped, in this case the bird (ignored).
   *   @param {object} gap - Game object that was overlapped, in this case the gap.
   */
  updateScore(_, gap) {
    score++;
    gap.destroy();

    if (score % 10 == 0) {
      backgroundDay.visible = !backgroundDay.visible;
      backgroundNight.visible = !backgroundNight.visible;

      if (currentPipe === this.assets.obstacle.pipe.green)
        currentPipe = this.assets.obstacle.pipe.red;
      else currentPipe = this.assets.obstacle.pipe.green;
    }

    updateScoreboard();
  }

  /**
   * Create pipes and gap in the game.
   * @param {object} scene - Game scene.
   */
  makePipes(scene) {
    if (!gameStarted || gameOver) return;

    const pipeTopY = Phaser.Math.Between(-120, 120);

    const gap = scene.add.line(288, pipeTopY + 210, 0, 0, 0, 98);
    gapsGroup.add(gap);
    gap.body.allowGravity = false;
    gap.visible = false;

    const pipeTop = pipesGroup.create(288, pipeTopY, currentPipe.top);
    pipeTop.body.allowGravity = false;

    const pipeBottom = pipesGroup.create(
      288,
      pipeTopY + 420,
      currentPipe.bottom
    );
    pipeBottom.body.allowGravity = false;
  }

  /**
   * Move the bird in the screen.
   */
  moveBird() {
    if (gameOver) return;

    if (!gameStarted) startGame(game.scene.scenes[0]);

    player.setVelocityY(-400);
    player.angle = -15;
    framesMoveUp = 5;
  }

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
  updateScoreboard() {
    scoreboardGroup.clear(true, true);

    const scoreAsString = score.toString();
    if (scoreAsString.length == 1)
      scoreboardGroup
        .create(
          this.assets.scene.width,
          30,
          this.assets.scoreboard.base + score
        )
        .setDepth(10);
    else {
      let initialPosition =
        this.assets.scene.width -
        (score.toString().length * this.assets.scoreboard.width) / 2;

      for (let i = 0; i < scoreAsString.length; i++) {
        scoreboardGroup
          .create(
            initialPosition,
            30,
            this.assets.scoreboard.base + scoreAsString[i]
          )
          .setDepth(10);
        initialPosition += this.assets.scoreboard.width;
      }
    }
  }

  /**
   * Restart the game.
   * Clean all groups, hide game over objects and stop game physics.
   */
  restartGame() {
    pipesGroup.clear(true, true);
    pipesGroup.clear(true, true);
    gapsGroup.clear(true, true);
    scoreboardGroup.clear(true, true);
    player.destroy();
    gameOverBanner.visible = false;
    restartButton.visible = false;

    const gameScene = game.scene.scenes[0];
    prepareGame();

    gameScene.physics.resume();
  }

  /**
   * Restart all variable and configurations, show main and recreate the bird.
   * @param {object} scene - Game scene.
   */
  prepareGame() {
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

    this.ground.anims.play(this.assets.animation.ground.moving, true);
  }

  /**
   * Start the game, create pipes and hide the main menu.
   * @param {object} scene - Game scene.
   */
  startGame(scene) {
    this.gameStarted = true;
    this.messageInitial.visible = false;

    const score0 = scoreboardGroup.create(
      this.assets.scene.width,
      30,
      this.assets.scoreboard.number0
    );
    score0.setDepth(20);

    makePipes(scene);
  }
}
