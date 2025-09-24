const config = {
  type: Phaser.AUTO,
  width: 1200,
  height: 900,
  
  // ▼▼▼ 追加: ゲームを描画する親要素のIDを指定 ▼▼▼
  parent: 'game-container',
  // ▲▲▲ 追加 ▲▲▲

  scale: {
    mode: Phaser.Scale.FIT,
    // autoCenter: Phaser.Scale.CENTER_BOTH
  },
  pixelArt: true,
  backgroundColor: '#000000',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 1000 },
    },
  },
  scene: GameScene
};

// ゲームを開始
new Phaser.Game(config);