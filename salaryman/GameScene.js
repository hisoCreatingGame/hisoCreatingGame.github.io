class GameScene extends Phaser.Scene {
  // ▼▼▼ 追加: シーンに 'Game' というキー（名前）を設定 ▼▼▼
  constructor() {
    super('Game');
  }
  // ▲▲▲ 追加 ▲▲▲

  preload() {
    SalarymanImage.init();
  }

  create() {
    this.screenWidth = this.game.config.width;
    this.screenHeight = this.game.config.height;
    this.screenX = 0;
    this.screenY = 0;

    this.add.rectangle(
      this.screenWidth / 2,
      this.screenHeight / 2,
      this.screenWidth,
      this.screenHeight,
      0xffffff
    );

    this.physics.world.setBounds(this.screenX, this.screenY, this.screenWidth, this.screenHeight);

    this.stage = 1;
    this.isTransitioning = false;
    this.isGameStarted = false;
    
    // (salarymanImageのフレーム生成処理は変更なし)
    const frames = SalarymanImage.frames;
    const frameWidth = frames[0][0].length;
    const frameHeight = frames[0].length;
    frames.forEach((frame, i) => {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0x000000);
      frame.forEach((row, y) => {
        row.split("").forEach((char, x) => {
          if (char === "#") { g.fillRect(x, y, 1, 1); }
        });
      });
      g.generateTexture("player" + i, frameWidth, frameHeight);
      g.destroy();
    });

    this.anims.create({
      key: "walk",
      frames: [
        { key: "player0" }, { key: "player1" },
        { key: "player2" }, { key: "player3" },
      ],
      frameRate: 5,
      repeat: -1,
    });
    
    this.player = this.physics.add.sprite(this.screenWidth / 2, this.screenHeight / 2, "player0").setScale(2);
    
    const maskShape = this.make.graphics();
    maskShape.fillStyle(0xffffff);
    maskShape.fillRect(this.screenX, this.screenY, this.screenWidth, this.screenHeight);
    const mask = maskShape.createGeometryMask();
    this.player.setMask(mask);

    this.player.faceDirection = 'right';
    this.player.setVisible(false);

    this.cursors = this.input.keyboard.addKeys('K,J,H,L');
    this.playerSpeed = 300;

    const panelBg = this.add.rectangle(this.screenWidth / 2, this.screenHeight / 2, 1200, 900, 0x000000, 1);
    this.stageText = this.add.text(this.screenWidth / 2, this.screenHeight / 2 - 20, '', { fontSize: '32px', fill: '#ffffff' }).setOrigin(0.5);
    this.startText = this.add.text(this.screenWidth / 2, this.screenHeight / 2 + 30, '', { fontSize: '20px', fill: '#ffffff' }).setOrigin(0.5);
    this.panelContainer = this.add.container(0, 0, [panelBg, this.stageText, this.startText]);
    this.panelContainer.setDepth(10);
    this.panelContainer.setVisible(false);

    this.showTitleScreen();
    this.input.keyboard.once('keydown-SPACE', this.startGame, this);

    // ▼▼▼ 追加: 地面のテクスチャをプログラムで生成 ▼▼▼
    const groundTextureWidth = 64;
    const groundTextureHeight = 20;
    const g = this.make.graphics({ add: false });
    g.fillStyle(0x000000); // 茶色
    g.fillRect(0, 0, groundTextureWidth, groundTextureHeight);
    g.generateTexture('groundTexture', groundTextureWidth, groundTextureHeight);
    g.destroy();
    // ▲▲▲ 追加 ▲▲▲

    // ▼▼▼ 修正: 地面をTileSpriteで作成し、物理演算を有効化 ▼▼▼
    const groundY = this.screenHeight - 10;
    this.ground = this.add.tileSprite(this.screenWidth / 2, groundY, this.screenWidth, 20, 'groundTexture');
    this.physics.add.existing(this.ground, true); // trueで静的オブジェクトになる
    
    this.physics.add.collider(this.player, this.ground);
    // ▲▲▲ 修正 ▲▲▲
  }

  // (update, showTitleScreen, startGame, warpPlayer, startStageTransition, enforceBounds メソッドは変更なし)
  update() {
    if (!this.isGameStarted || this.isTransitioning) {
      this.player.setVelocity(0); return;
    }
    if (this.cursors.H.isDown) {
      this.player.setVelocityX(-this.playerSpeed);
      this.player.flipX = false;
    } else if (this.cursors.L.isDown) {
      this.player.setVelocityX(this.playerSpeed);
      this.player.flipX = true;
    } else {
      this.player.setVelocityX(0);
    }
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
      this.player.x = this.screenWidth + playerHalfWidth;
      this.player.y = this.screenHeight / 2;
      this.player.setVisible(true);
      this.isTransitioning = false;
    });
  }
  enforceBounds() {
    const playerHalfWidth = this.player.displayWidth / 2;
    const playerHalfHeight = this.player.displayHeight / 2;
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