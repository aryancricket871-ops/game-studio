function startRunner(parentId, cfg) {
  const w = Math.min(window.innerWidth - 20, 480), h = 320;
  const hex = c => parseInt(c.slice(1), 16);
  let player, obstacles, score, scoreText, dead;

  function create() {
    const s = this;
    dead = false; score = 0;
    const ground = s.add.rectangle(w / 2, h - 20, w, 40, hex(cfg.groundColor));
    s.physics.add.existing(ground, true);
    player = s.add.rectangle(60, h - 56, 32, 32, hex(cfg.playerColor));
    s.physics.add.existing(player);
    s.physics.add.collider(player, ground);
    obstacles = s.physics.add.group({ allowGravity: false });
    scoreText = s.add.text(10, 10, "Score: 0", { fontSize: "18px", color: "#fff" });

    const jump = () => {
      if (dead) { s.scene.restart(); return; }
      if (player.body.blocked.down || player.body.touching.down)
        player.body.setVelocityY(-cfg.jump);
    };
    s.input.on("pointerdown", jump);
    s.input.keyboard.on("keydown-SPACE", jump);

    s.time.addEvent({ delay: cfg.spawnMs, loop: true, callback: () => {
      if (dead) return;
      const oh = Phaser.Math.Between(24, 50);
      const ob = s.add.rectangle(w + 20, h - 40 - oh / 2, 24, oh, hex(cfg.obstacleColor));
      s.physics.add.existing(ob);
      obstacles.add(ob);
      ob.body.allowGravity = false;
      ob.body.setVelocityX(-cfg.speed);
    }});

    s.physics.add.overlap(player, obstacles, () => {
      dead = true;
      s.physics.pause();
      s.add.text(w / 2, h / 2, "Game Over\nTap to restart",
        { fontSize: "24px", color: "#fff", align: "center" }).setOrigin(0.5);
    });
  }

  function update(t, dt) {
    if (dead) return;
    score += dt / 100;
    scoreText.setText("Score: " + Math.floor(score));
    obstacles.getChildren().forEach(o => { if (o.x < -40) o.destroy(); });
  }

  return new Phaser.Game({
    type: Phaser.AUTO, parent: parentId, width: w, height: h,
    backgroundColor: cfg.bgColor,
    physics: { default: "arcade", arcade: { gravity: { y: cfg.gravity } } },
    scene: { create, update }
  });
                                     }
