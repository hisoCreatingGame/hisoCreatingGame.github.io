const config = {
  type: Phaser.AUTO,
  width: 1200,
  height: 900,
  parent: 'game-container',
  scale: {
    mode: Phaser.Scale.FIT,
  },
  pixelArt: true,
  backgroundColor: '#000000',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 500 },
    },
  },
  scene: GameScene
};

// ゲームを開始
new Phaser.Game(config);