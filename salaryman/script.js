class MyScene extends Phaser.Scene {
  preload() {
    salarymanImage.init();
  }

  create() {
    const frames = salarymanImage.frames;
    const frameWidth = frames[0][0].length;
    const frameHeight = frames[0].length;

    frames.forEach((frame, i) => {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0x000000);
      frame.forEach((row, y) => {
        row.split("").forEach((char, x) => {
          if (char === "#") {
            g.fillRect(x, y, 1, 1);
          }
        });
      });
      g.generateTexture("player" + i, frameWidth, frameHeight);
      g.destroy();
    });

    this.anims.create({
      key: "walk",
      frames: [
        { key: "player0" },
        { key: "player1" },
        { key: "player2" },
        { key: "player3" },
      ],
      frameRate: 4, // Increased frame rate for a more noticeable walk
      repeat: -1,
    });

    this.player = this.physics.add.sprite(300, 400, "player0").setScale(2);
    
    // Initialize player facing direction (e.g., 'right' by default)
    this.player.faceDirection = 'right';

    this.cursors = this.input.keyboard.addKeys('K,J,H,L');
    this.playerSpeed = 200;
  }

  update() {
    // Reset player velocity
    this.player.setVelocity(0);

    // Track if the player is currently moving
    let isMoving = false;

    if (this.cursors.K.isDown) {
      this.player.setVelocityY(-this.playerSpeed);
      isMoving = true;
    } else if (this.cursors.J.isDown) {
      this.player.setVelocityY(this.playerSpeed);
      isMoving = true;
    }

    if (this.cursors.H.isDown) {
      this.player.setVelocityX(-this.playerSpeed);
      this.player.flipX = false; // Flip sprite horizontally for left movement
      this.player.faceDirection = 'left';
      isMoving = true;
    } else if (this.cursors.L.isDown) {
      this.player.setVelocityX(this.playerSpeed);
      this.player.flipX = true; // Ensure sprite is not flipped for right movement
      this.player.faceDirection = 'right';
      isMoving = true;
    }

    // Play or stop animation based on movement
    if (isMoving) {
      if (!this.player.anims.isPlaying || this.player.anims.currentAnim.key !== "walk") {
        this.player.play("walk");
      }
    } else {
      this.player.stop(); // Stop animation when not moving
      // Optionally, set to a 'idle' frame if you have one, e.g., this.player.setFrame('player0');
      this.player.setTexture('player0'); // Set to the first frame (idle stance)
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 600,
  height: 800,
  pixelArt: true,
  backgroundColor: '#ffffff',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
    },
  },
  scene: MyScene,
};

new Phaser.Game(config);