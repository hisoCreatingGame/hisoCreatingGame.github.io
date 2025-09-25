class MyScene extends Phaser.Scene {
  preload() {
    SalarymanImage.init();
  }

  create() {
    // 画面サイズに合わせてプレイエリアの変数を設定 (画面全体)
    this.screenWidth = this.game.config.width; // 1200
    this.screenHeight = this.game.config.height; // 900
    this.screenX = 0;
    this.screenY = 0;

    // 背景の白い四角形を画面全体に設定
    this.add.rectangle(
      this.screenWidth / 2, // 中央X
      this.screenHeight / 2, // 中央Y
      this.screenWidth,
      this.screenHeight,
      0xffffff
    );

    // 物理ワールドの境界を画面全体に設定
    this.physics.world.setBounds(this.screenX, this.screenY, this.screenWidth, this.screenHeight);

    this.stage = 1;
    this.isTransitioning = false;
    this.isGameStarted = false;
    
    const frames = SalarymanImage.frames;
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
      frameRate: 4,
      repeat: -1,
    });
    
    // プレイヤーの初期位置を調整
    this.player = this.physics.add.sprite(this.screenWidth / 2, this.screenHeight / 2, "player0").setScale(2);
    
    // マスクを画面全体に設定
    const maskShape = this.make.graphics();
    maskShape.fillStyle(0xffffff);
    maskShape.fillRect(this.screenX, this.screenY, this.screenWidth, this.screenHeight);
    const mask = maskShape.createGeometryMask();
    this.player.setMask(mask);

    this.player.faceDirection = 'right';
    this.player.setVisible(false);

    this.cursors = this.input.keyboard.addKeys('K,J,H,L');
    this.playerSpeed = 200;

    // UIパネルの位置を新しい画面サイズの中央に調整
    const panelBg = this.add.rectangle(this.screenWidth / 2, this.screenHeight / 2, 1200, 900, 0x000000, 0.8);
    this.stageText = this.add.text(this.screenWidth / 2, this.screenHeight / 2 - 20, '', { fontSize: '32px', fill: '#ffffff' }).setOrigin(0.5);
    this.startText = this.add.text(this.screenWidth / 2, this.screenHeight / 2 + 30, '', { fontSize: '20px', fill: '#ffffff' }).setOrigin(0.5);
    
    this.panelContainer = this.add.container(0, 0, [panelBg, this.stageText, this.startText]);
    this.panelContainer.setDepth(10);
    this.panelContainer.setVisible(false);

    this.showTitleScreen();
    this.input.keyboard.once('keydown-SPACE', this.startGame, this);

    // 地面を作成し、新しい画面サイズに合わせる
    this.platforms = this.physics.add.staticGroup();
    const groundY = this.screenHeight - 10;
    this.platforms.create(this.screenWidth / 2, groundY, 'ground').setDisplaySize(this.screenWidth, 20).refreshBody();

    this.physics.add.collider(this.player, this.platforms);
  }

  update() {
    if (!this.isGameStarted || this.isTransitioning) {
      this.player.setVelocity(0);
      return;
    }

    // ▼▼▼ 修正: flipX の true/false を逆に設定 ▼▼▼
    if (this.cursors.H.isDown) { // 左移動
      this.player.setVelocityX(-this.playerSpeed);
      this.player.flipX = false; // 向きを反転させない
    } else if (this.cursors.L.isDown) { // 右移動
      this.player.setVelocityX(this.playerSpeed);
      this.player.flipX = true; // 向きを反転させる
    } else {
      this.player.setVelocityX(0);
    }
    // ▲▲▲ 修正 ▲▲▲

    if (this.cursors.K.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-400);
    }

    if (this.player.body.touching.down && this.player.body.velocity.x !== 0) {
        if (!this.player.anims.isPlaying || this.player.anims.currentAnim.key !== "walk") {
            this.player.play("walk");
        }
    } else {
        this.player.stop();
        this.player.setTexture('player0');
    }

    this.warpPlayer();
    this.enforceBounds();
  }
  
  showTitleScreen() {
    this.stageText.setText('Buto-Ha-Salaryman');
    this.startText.setText('Press SPACE to Start');
    this.startText.setVisible(true);
    this.panelContainer.setVisible(true);
  }

  startGame() {
    this.stageText.setText('STAGE ' + this.stage);
    this.startText.setVisible(false);
    this.time.delayedCall(1000, () => {
      this.isGameStarted = true;
      this.panelContainer.setVisible(false);
      this.player.setVisible(true);
    });
  }

  warpPlayer() {
    const playerHalfWidth = this.player.displayWidth / 2;
    if (this.player.x < this.screenX - playerHalfWidth) {
      this.startStageTransition();
    }
  }

  startStageTransition() {
    if (this.isTransitioning) return;
    this.isTransitioning = true;
    this.stage++;
    this.player.setVelocity(0);
    this.player.setVisible(false);
    this.stageText.setText('STAGE ' + this.stage);
    this.panelContainer.setVisible(true);
    this.time.delayedCall(1000, () => {
      this.panelContainer.setVisible(false);
      const playerHalfWidth = this.player.displayWidth / 2;
      // リスポーン位置を調整
      this.player.x = this.screenWidth + playerHalfWidth;
      this.player.y = this.screenHeight / 2;
      this.player.setVisible(true);
      this.isTransitioning = false;
    });
  }

  enforceBounds() {
    const playerHalfWidth = this.player.displayWidth / 2;
    const playerHalfHeight = this.player.displayHeight / 2;
    
    // 境界判定を調整
    const rightBound = this.screenWidth - playerHalfWidth;
    if (this.player.x > rightBound) {
        this.player.x = rightBound;
    }
    const topBound = this.screenY + playerHalfHeight;
    if (this.player.y < topBound) {
        this.player.y = topBound;
    }
  }
}

// ▼▼▼ 修正: configの画面サイズを変更 ▼▼▼
const config = {
  type: Phaser.AUTO,
  width: 1200,
  height: 900,
  pixelArt: true,
  backgroundColor: '#333333',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 500 },
    },
  },
  scene: MyScene,
};
// ▲▲▲ 修正 ▲▲▲

new Phaser.Game(config);